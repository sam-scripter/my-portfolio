from fastapi import APIRouter
from app.models.schemas import IngestRequest

router = APIRouter(prefix="/ingest", tags=["ingest"])

@router.post("")
async def ingest(request: IngestRequest = None):
    # Placeholder — full implementation in Phase 3
    return {
        "chunks_added": 0,
        "chunks_updated": 0,
        "sources_processed": []
    }