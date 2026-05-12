"""
Knowledge Base Ingestion Script
================================
Reads all .md files from the knowledge/ folder, splits them into
chunks, generates OpenAI embeddings for each chunk, and stores
everything in the knowledge_chunks PostgreSQL table.

Usage:
    python scripts/ingest.py                          # ingest all files
    python scripts/ingest.py --file knowledge/faq.md  # single file

Run this:
    - Once now to populate the knowledge base
    - After adding any new .md file to knowledge/
    - After editing an existing .md file
    - From the admin panel (calls the /ingest API endpoint which
      triggers this logic inside the Python service)
"""

import os
import sys
import json
import hashlib
import argparse
import psycopg2
import tiktoken
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

# ── Load environment variables from backend-python/.env ──────────────
# The script lives in scripts/ but reads config from backend-python/.env
load_dotenv(Path(__file__).parent.parent / "backend-python" / ".env")

# ── Configuration ─────────────────────────────────────────────────────
OPENAI_API_KEY   = os.getenv("OPENAI_API_KEY")
DATABASE_URL     = os.getenv("DATABASE_URL")
EMBEDDING_MODEL  = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
KNOWLEDGE_DIR    = Path(__file__).parent.parent / "knowledge"

# Chunking config:
# MAX_TOKENS: maximum tokens per chunk. 500 is a good balance —
#   large enough for meaningful context, small enough for precise retrieval.
#   If chunks are too large, retrieved context becomes noisy.
#   If too small, retrieved chunks lose their surrounding context.
MAX_TOKENS       = 500

# OVERLAP_TOKENS: how many tokens of the previous chunk to repeat
#   at the start of the next chunk. This ensures a sentence that
#   falls near a chunk boundary doesn't lose its context entirely.
OVERLAP_TOKENS   = 50

# Batch size for OpenAI embedding API calls.
# OpenAI supports up to 2048 inputs per batch, but we keep it
# small to stay well within rate limits.
BATCH_SIZE       = 20


def get_tokenizer():
    """
    Returns a tokenizer compatible with the embedding model.
    tiktoken is OpenAI's tokenizer — it counts tokens the same way
    the API does, so our chunk sizes are accurate.
    cl100k_base is the encoding used by text-embedding-3-small.
    """
    return tiktoken.get_encoding("cl100k_base")


def chunk_text(text: str, source: str) -> list[dict]:
    """
    Splits a markdown document into overlapping chunks.

    Strategy:
    1. Split by heading (## and ###) first — each section becomes
       a natural chunk boundary. Headings provide context for the
       content that follows.
    2. If a section exceeds MAX_TOKENS, split further on paragraph
       boundaries (blank lines).
    3. Add OVERLAP_TOKENS from the end of the previous chunk to
       the start of the next — preserves context across boundaries.

    Returns a list of dicts:
        { content: str, source: str, chunk_index: int, heading: str }
    """
    tokenizer = get_tokenizer()
    chunks = []
    chunk_index = 0
    current_heading = ""

    # Split document into sections by heading
    # A section starts with ## or ### at the beginning of a line
    import re
    sections = re.split(r'\n(?=##+ )', text)

    for section in sections:
        if not section.strip():
            continue

        # Extract the heading from this section (first line if it starts with #)
        lines = section.strip().split('\n')
        if lines[0].startswith('#'):
            current_heading = lines[0].lstrip('#').strip()

        section_tokens = tokenizer.encode(section)

        if len(section_tokens) <= MAX_TOKENS:
            # Section fits in one chunk — use it as-is
            chunks.append({
                "content": section.strip(),
                "source": source,
                "chunk_index": chunk_index,
                "heading": current_heading,
                "char_count": len(section),
            })
            chunk_index += 1
        else:
            # Section is too large — split on paragraph boundaries
            paragraphs = section.split('\n\n')
            current_chunk_tokens = []
            current_chunk_text = []

            for paragraph in paragraphs:
                if not paragraph.strip():
                    continue

                para_tokens = tokenizer.encode(paragraph)

                # If adding this paragraph would exceed the limit,
                # save the current chunk and start a new one
                if (len(current_chunk_tokens) + len(para_tokens) > MAX_TOKENS
                        and current_chunk_text):

                    # Save current chunk
                    chunk_content = '\n\n'.join(current_chunk_text)
                    chunks.append({
                        "content": chunk_content.strip(),
                        "source": source,
                        "chunk_index": chunk_index,
                        "heading": current_heading,
                        "char_count": len(chunk_content),
                    })
                    chunk_index += 1

                    # Start new chunk with overlap from the end of the last one
                    # Take the last OVERLAP_TOKENS tokens worth of text
                    overlap_text = current_chunk_text[-1] if current_chunk_text else ""
                    overlap_tokens = tokenizer.encode(overlap_text)
                    if len(overlap_tokens) > OVERLAP_TOKENS:
                        # Trim the overlap to OVERLAP_TOKENS
                        overlap_text = tokenizer.decode(overlap_tokens[-OVERLAP_TOKENS:])

                    current_chunk_text = [overlap_text] if overlap_text else []
                    current_chunk_tokens = tokenizer.encode(overlap_text) if overlap_text else []

                current_chunk_text.append(paragraph)
                current_chunk_tokens.extend(para_tokens)

            # Don't forget the last chunk
            if current_chunk_text:
                chunk_content = '\n\n'.join(current_chunk_text)
                chunks.append({
                    "content": chunk_content.strip(),
                    "source": source,
                    "chunk_index": chunk_index,
                    "heading": current_heading,
                    "char_count": len(chunk_content),
                })
                chunk_index += 1

    return chunks


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Calls the OpenAI embeddings API for a batch of texts.
    Returns a list of embedding vectors (each is a list of 1536 floats).

    We batch calls to avoid hitting rate limits on large ingestions.
    """
    client = OpenAI(api_key=OPENAI_API_KEY)
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts,
    )
    # Sort by index to ensure order matches input order
    return [item.embedding for item in sorted(response.data, key=lambda x: x.index)]


def upsert_chunks(chunks: list[dict], embeddings: list[list[float]], conn) -> tuple[int, int]:
    """
    Inserts or updates chunks in the knowledge_chunks table.

    Uses INSERT ... ON CONFLICT (source, chunk_index) DO UPDATE
    so re-running the script after editing a document updates
    the existing chunks rather than creating duplicates.

    Returns (inserted_count, updated_count)
    """
    cur = conn.cursor()
    inserted = 0
    updated = 0

    for chunk, embedding in zip(chunks, embeddings):
        # Convert embedding list to PostgreSQL vector format string
        # pgvector accepts '[0.1, 0.2, ...]' format
        embedding_str = '[' + ','.join(str(x) for x in embedding) + ']'

        metadata = json.dumps({
            "heading": chunk["heading"],
            "chunk_index": chunk["chunk_index"],
            "char_count": chunk["char_count"],
        })

        # ON CONFLICT: if a chunk with the same source + chunk_index
        # already exists, update it. This makes the script safe to re-run.
        cur.execute("""
            INSERT INTO knowledge_chunks (content, source, embedding, metadata)
            VALUES (%s, %s, %s::vector, %s::jsonb)
            ON CONFLICT (source, chunk_index)
            DO UPDATE SET
                content   = EXCLUDED.content,
                embedding = EXCLUDED.embedding,
                metadata  = EXCLUDED.metadata
            RETURNING (xmax = 0) AS inserted
        """, (
            chunk["content"],
            chunk["source"],
            embedding_str,
            metadata,
        ))

        # xmax = 0 means a new row was inserted (not updated)
        row = cur.fetchone()
        if row and row[0]:
            inserted += 1
        else:
            updated += 1

    conn.commit()
    cur.close()
    return inserted, updated


def ingest_file(filepath: Path, conn) -> tuple[int, int]:
    """
    Ingests a single .md file into the knowledge base.
    Returns (inserted, updated) counts.
    """
    # Source name is the relative path from knowledge/ without extension
    # e.g. knowledge/projects/stratum.md → projects/stratum
    source = str(filepath.relative_to(KNOWLEDGE_DIR).with_suffix(''))
    source = source.replace('\\', '/')  # normalize Windows paths

    print(f"\n  📄 Processing: {source}")

    text = filepath.read_text(encoding='utf-8')
    chunks = chunk_text(text, source)

    print(f"     Split into {len(chunks)} chunks")

    if not chunks:
        print(f"     ⚠️  No chunks generated — file may be empty")
        return 0, 0

    total_inserted = 0
    total_updated = 0

    # Process in batches to avoid rate limiting
    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i:i + BATCH_SIZE]
        texts = [c["content"] for c in batch]

        print(f"     Embedding batch {i//BATCH_SIZE + 1}/{(len(chunks)-1)//BATCH_SIZE + 1} ({len(texts)} chunks)...")

        embeddings = get_embeddings(texts)
        ins, upd = upsert_chunks(batch, embeddings, conn)
        total_inserted += ins
        total_updated += upd

    print(f"     ✅ {total_inserted} inserted, {total_updated} updated")
    return total_inserted, total_updated


def add_unique_constraint(conn):
    """
    Adds the unique constraint on (source, chunk_index) if it doesn't exist.
    This is needed for the ON CONFLICT upsert to work.
    We add it here rather than in the schema so the script is self-healing.
    """
    cur = conn.cursor()
    cur.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'knowledge_chunks_source_chunk_index_key'
            ) THEN
                ALTER TABLE knowledge_chunks
                ADD CONSTRAINT knowledge_chunks_source_chunk_index_key
                UNIQUE (source, chunk_index);
            END IF;
        END $$;
    """)
    conn.commit()
    cur.close()


def main():
    parser = argparse.ArgumentParser(description='Ingest knowledge base documents into pgvector')
    parser.add_argument('--file', type=str, help='Ingest a single file (path relative to repo root)')
    args = parser.parse_args()

    # Validate config
    if not OPENAI_API_KEY or OPENAI_API_KEY == 'sk-placeholder':
        print("❌ Error: OPENAI_API_KEY is not set in backend-python/.env")
        print("   Get your key at: https://platform.openai.com/api-keys")
        sys.exit(1)

    if not DATABASE_URL:
        print("❌ Error: DATABASE_URL is not set in backend-python/.env")
        sys.exit(1)

    print("🔌 Connecting to database...")
    conn = psycopg2.connect(DATABASE_URL)
    print("✅ Connected")

    # Ensure unique constraint exists for upsert to work
    add_unique_constraint(conn)

    total_inserted = 0
    total_updated = 0

    if args.file:
        # Single file mode
        filepath = Path(args.file)
        if not filepath.exists():
            print(f"❌ File not found: {filepath}")
            sys.exit(1)
        ins, upd = ingest_file(filepath, conn)
        total_inserted += ins
        total_updated += upd
    else:
        # All files mode — find every .md file in knowledge/
        md_files = sorted(KNOWLEDGE_DIR.rglob("*.md"))

        if not md_files:
            print(f"❌ No .md files found in {KNOWLEDGE_DIR}")
            sys.exit(1)

        print(f"\n📚 Found {len(md_files)} documents to ingest:")
        for f in md_files:
            rel = f.relative_to(KNOWLEDGE_DIR)
            print(f"   - {rel}")

        for filepath in md_files:
            ins, upd = ingest_file(filepath, conn)
            total_inserted += ins
            total_updated += upd

    conn.close()

    print(f"\n{'='*50}")
    print(f"✅ Ingestion complete")
    print(f"   Chunks inserted: {total_inserted}")
    print(f"   Chunks updated:  {total_updated}")
    print(f"   Total chunks:    {total_inserted + total_updated}")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()