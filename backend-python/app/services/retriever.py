"""
Vector Retriever
=================
Converts a question into a vector, then searches the knowledge_chunks
table for the most semantically similar chunks using pgvector's
cosine similarity operator (<=>).

This is the core of RAG — Retrieval Augmented Generation.
The retrieved chunks become the context injected into the LLM prompt,
grounding the AI's answer in Samuel's actual documented experience.

Cosine similarity measures the angle between two vectors in
1536-dimensional space. Vectors that point in similar directions
(similar meaning) have a high similarity score (close to 1.0).
Vectors pointing in different directions (different meaning)
have a low score (close to 0.0).

Example:
  Question: "What state management does Samuel use in Flutter?"
  This question's vector will be very close to the chunk from
  skills_detail.md that discusses Riverpod — even though the
  question and the chunk share very few exact words.
"""

import os
import psycopg2
import psycopg2.extras
from openai import OpenAI
from app.config import settings


def get_db_connection():
    """
    Creates a new PostgreSQL connection.
    Called fresh on each request — in production this would be
    a connection pool (asyncpg or pgbouncer), but for our traffic
    levels a fresh connection per request is fine.
    """
    return psycopg2.connect(settings.database_url)


def embed_query(query: str) -> list[float]:
    """
    Converts a text query into a 1536-dimensional vector using
    the same model used during ingestion (text-embedding-3-small).

    Critical: you must use the same model for querying as you used
    for ingestion. Different models produce incompatible vector spaces —
    similarity search would return nonsense results.
    """
    client = OpenAI(api_key=settings.openai_api_key)
    response = client.embeddings.create(
        model=settings.openai_embedding_model,
        input=query,
    )
    return response.data[0].embedding


def retrieve_context(query: str, top_k: int = None) -> list[dict]:
    """
    Main retrieval function. Given a question string, returns the
    top-K most relevant knowledge chunks.

    Args:
        query:  The user's question
        top_k:  Number of chunks to retrieve. Defaults to
                settings.max_context_chunks (5).
                More chunks = more context but more tokens used.

    Returns:
        List of dicts, each containing:
            - content:  The chunk text (injected into the LLM prompt)
            - source:   Which document this came from (e.g. "projects/stratum")
            - score:    Cosine similarity score (0.0 to 1.0)
            - heading:  The section heading this chunk falls under
    """
    if top_k is None:
        top_k = settings.max_context_chunks

    # Step 1: Embed the query using the same model as ingestion
    query_embedding = embed_query(query)

    # Step 2: Format as PostgreSQL vector string
    embedding_str = '[' + ','.join(str(x) for x in query_embedding) + ']'

    # Step 3: Run cosine similarity search
    # The <=> operator is pgvector's cosine distance operator.
    # Distance = 1 - similarity, so lower distance = more similar.
    # We subtract from 1 to get similarity (higher = more relevant).
    # We filter out chunks with similarity below 0.3 — anything lower
    # is likely irrelevant noise and would confuse the AI.
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT
            content,
            source,
            metadata,
            1 - (embedding <=> %s::vector) AS similarity_score
        FROM knowledge_chunks
        WHERE 1 - (embedding <=> %s::vector) > 0.3
        ORDER BY embedding <=> %s::vector
        LIMIT %s
    """, (embedding_str, embedding_str, embedding_str, top_k))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    # Build result list
    results = []
    for row in rows:
        metadata = row["metadata"] or {}
        results.append({
            "content": row["content"],
            "source": row["source"],
            "score": round(float(row["similarity_score"]), 4),
            "heading": metadata.get("heading", ""),
        })

    return results


def format_context_for_prompt(chunks: list[dict]) -> str:
    """
    Formats retrieved chunks into a string to be injected into
    the LLM system prompt.

    Each chunk is separated by a divider so the AI can distinguish
    where one piece of information ends and another begins.
    The source label helps the AI understand what type of information
    it is reading (profile vs project vs FAQ).
    """
    if not chunks:
        return "No specific context retrieved."

    formatted = []
    for chunk in chunks:
        source_label = chunk["source"].replace("/", " > ").replace("_", " ").title()
        formatted.append(
            f"[Source: {source_label}]\n{chunk['content']}"
        )

    return "\n\n---\n\n".join(formatted)