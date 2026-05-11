from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, FitRequest
import json

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("")
async def chat(request: ChatRequest):
    # Placeholder — full implementation in Phase 3
    async def stream():
        message = "RAG service is running. Full implementation coming in Phase 3."
        for word in message.split():
            yield f"data: {json.dumps({'token': word + ' '})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream")

@router.post("/analyze-fit")
async def analyze_fit(request: FitRequest):
    # Placeholder — full implementation in Phase 3
    return {
        "overall_score": 0,
        "summary": "Fit analysis coming in Phase 3.",
        "requirements": [],
        "gaps": [],
        "suggested_questions": []
    }