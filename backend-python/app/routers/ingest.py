"""
Ingest Router
==============
POST /ingest

Triggers the knowledge base embedding pipeline from inside
the running FastAPI service. Called by:
  - The Fastify admin API (POST /api/admin/knowledge/ingest)
  - Which is called by the admin dashboard UI

Two modes:
  1. No body / empty body: re-ingests ALL .md files from knowledge/
  2. Body with file_content + source_name: ingests a single document
     (used when adding a new project via the admin panel)

This endpoint essentially runs the same logic as scripts/ingest.py
but as a live API call rather than a CLI script.
"""

import os
import re
import json
import psycopg2
from pathlib import Path
from fastapi import APIRouter, HTTPException
from openai import OpenAI

from app.config import settings
from app.models.schemas import IngestRequest

router = APIRouter(prefix="/ingest", tags=["ingest"])
client = OpenAI(api_key=settings.openai_api_key)

# Path to the knowledge/ folder — two levels up from app/
KNOWLEDGE_DIR = Path(__file__).parent.parent.parent.parent / "knowledge"

# Chunking config — must match scripts/ingest.py exactly
# so re-ingestion produces consistent chunk sizes
MAX_TOKENS    = 500
OVERLAP_TOKENS = 50
BATCH_SIZE    = 20


def get_tokenizer():
    import tiktoken
    return tiktoken.get_encoding("cl100k_base")


def chunk_text(text: str, source: str) -> list[dict]:
    """
    Splits a markdown document into overlapping chunks.
    Identical logic to scripts/ingest.py — kept in sync manually.
    If you change chunking logic here, update the script too.
    """
    tokenizer = get_tokenizer()
    chunks = []
    chunk_index = 0
    current_heading = ""

    sections = re.split(r'\n(?=##+ )', text)

    for section in sections:
        if not section.strip():
            continue

        lines = section.strip().split('\n')
        if lines[0].startswith('#'):
            current_heading = lines[0].lstrip('#').strip()

        section_tokens = tokenizer.encode(section)

        if len(section_tokens) <= MAX_TOKENS:
            chunks.append({
                "content": section.strip(),
                "source": source,
                "chunk_index": chunk_index,
                "heading": current_heading,
                "char_count": len(section),
            })
            chunk_index += 1
        else:
            paragraphs = section.split('\n\n')
            current_chunk_tokens = []
            current_chunk_text = []

            for paragraph in paragraphs:
                if not paragraph.strip():
                    continue

                para_tokens = tokenizer.encode(paragraph)

                if (len(current_chunk_tokens) + len(para_tokens) > MAX_TOKENS
                        and current_chunk_text):

                    chunk_content = '\n\n'.join(current_chunk_text)
                    chunks.append({
                        "content": chunk_content.strip(),
                        "source": source,
                        "chunk_index": chunk_index,
                        "heading": current_heading,
                        "char_count": len(chunk_content),
                    })
                    chunk_index += 1

                    overlap_text = current_chunk_text[-1] if current_chunk_text else ""
                    overlap_tokens = tokenizer.encode(overlap_text)
                    if len(overlap_tokens) > OVERLAP_TOKENS:
                        overlap_text = tokenizer.decode(overlap_tokens[-OVERLAP_TOKENS:])

                    current_chunk_text = [overlap_text] if overlap_text else []
                    current_chunk_tokens = tokenizer.encode(overlap_text) if overlap_text else []

                current_chunk_text.append(paragraph)
                current_chunk_tokens.extend(para_tokens)

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


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a batch of texts using OpenAI."""
    response = client.embeddings.create(
        model=settings.openai_embedding_model,
        input=texts,
    )
    return [item.embedding for item in sorted(response.data, key=lambda x: x.index)]


def upsert_chunks(chunks: list[dict], embeddings: list[list[float]], conn) -> tuple[int, int]:
    """Insert or update chunks in knowledge_chunks. Returns (inserted, updated)."""
    cur = conn.cursor()
    inserted = updated = 0

    for chunk, embedding in zip(chunks, embeddings):
        embedding_str = '[' + ','.join(str(x) for x in embedding) + ']'
        metadata = json.dumps({
            "heading": chunk["heading"],
            "chunk_index": chunk["chunk_index"],
            "char_count": chunk["char_count"],
        })

        cur.execute("""
            INSERT INTO knowledge_chunks
                (content, source, chunk_index, embedding, metadata)
            VALUES (%s, %s, %s, %s::vector, %s::jsonb)
            ON CONFLICT (source, chunk_index) DO UPDATE SET
                content   = EXCLUDED.content,
                embedding = EXCLUDED.embedding,
                metadata  = EXCLUDED.metadata
            RETURNING (xmax = 0) AS inserted
        """, (
            chunk["content"],
            chunk["source"],
            chunk["chunk_index"],
            embedding_str,
            metadata,
        ))

        row = cur.fetchone()
        if row and row[0]:
            inserted += 1
        else:
            updated += 1

    conn.commit()
    cur.close()
    return inserted, updated


def ingest_document(text: str, source: str, conn) -> dict:
    """
    Ingests a single document — chunks it, embeds it, upserts to DB.
    Returns a result summary dict.
    """
    chunks = chunk_text(text, source)
    if not chunks:
        return {"source": source, "chunks": 0, "inserted": 0, "updated": 0}

    total_inserted = total_updated = 0

    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i:i + BATCH_SIZE]
        texts = [c["content"] for c in batch]
        embeddings = embed_texts(texts)
        ins, upd = upsert_chunks(batch, embeddings, conn)
        total_inserted += ins
        total_updated += upd

    return {
        "source": source,
        "chunks": len(chunks),
        "inserted": total_inserted,
        "updated": total_updated,
    }


@router.post("")
async def ingest(request: IngestRequest = None):
    """
    Trigger knowledge base ingestion.

    Two modes:
    - No body or empty body: re-ingest ALL .md files from knowledge/
    - Body with file_content + source_name: ingest a single document

    The single-document mode is used by the admin panel when you
    add a new project — the case_study content gets embedded
    automatically so the AI knows about it immediately.
    """
    try:
        conn = psycopg2.connect(settings.database_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {e}")

    results = []

    try:
        if request and request.file_content and request.source_name:
            # ── Single document mode ──────────────────────────────────
            # Ingest one specific document passed in the request body.
            # Used when the admin panel adds/updates a project.
            result = ingest_document(
                text=request.file_content,
                source=request.source_name,
                conn=conn,
            )
            results.append(result)

        else:
            # ── Full re-ingestion mode ────────────────────────────────
            # Find and ingest every .md file in the knowledge/ folder.
            # Used for bulk refresh after editing multiple documents.
            if not KNOWLEDGE_DIR.exists():
                raise HTTPException(
                    status_code=500,
                    detail=f"Knowledge directory not found at {KNOWLEDGE_DIR}"
                )

            md_files = sorted(KNOWLEDGE_DIR.rglob("*.md"))

            if not md_files:
                raise HTTPException(
                    status_code=404,
                    detail="No .md files found in knowledge/ directory"
                )

            for filepath in md_files:
                source = str(
                    filepath.relative_to(KNOWLEDGE_DIR).with_suffix('')
                ).replace('\\', '/')

                text = filepath.read_text(encoding='utf-8')
                result = ingest_document(text=text, source=source, conn=conn)
                results.append(result)

    finally:
        conn.close()

    # Build summary
    total_chunks   = sum(r["chunks"]   for r in results)
    total_inserted = sum(r["inserted"] for r in results)
    total_updated  = sum(r["updated"]  for r in results)

    return {
        "success": True,
        "sources_processed": [r["source"] for r in results],
        "chunks_added": total_inserted,
        "chunks_updated": total_updated,
        "total_chunks": total_chunks,
        "details": results,
    }