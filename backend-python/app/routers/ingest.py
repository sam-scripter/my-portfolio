from fastapi import APIRouter
from app.models.schemas import IngestRequest

# prefix="/ingest" — this gives us POST /ingest
router = APIRouter(prefix="/ingest", tags=["ingest"])


@router.post("")
async def ingest(request: IngestRequest = None):
    """
    Triggers the knowledge base embedding pipeline.

    What "ingesting" means:
    Your knowledge documents (samuel_profile.md, projects/stratum.md, etc.)
    are plain text. The AI can't search them directly. We need to convert
    each chunk of text into a vector — a list of 1536 numbers that
    represents the semantic meaning of that text.

    Once stored in PostgreSQL with pgvector, we can find the most relevant
    chunks for any question by comparing vectors mathematically
    (cosine similarity — how "close" are two vectors in space).

    Example: the vector for "Flutter mobile development" will be very
    close to the vector for "Dart cross-platform apps" because they
    mean similar things — even though they share no words.

    Phase 3 will replace the placeholder with:
    1. Read .md files from knowledge/ folder (or use request body)
    2. Split into chunks (by heading, max 500 tokens)
    3. Call OpenAI embeddings API for each chunk
    4. Store chunk text + vector in knowledge_chunks table
    5. Return a report of what was added/updated
    """
    return {
        "chunks_added": 0,
        "chunks_updated": 0,
        "sources_processed": []
    }