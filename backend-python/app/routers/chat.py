from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, FitRequest, FitResponse
import json

# APIRouter is like a mini-app — a group of related endpoints.
# prefix="/chat" means every route here starts with /chat
# So "" becomes POST /chat, and "/analyze-fit" becomes POST /chat/analyze-fit
router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
async def chat(request: ChatRequest):
    """
    Main chat endpoint. Returns a streaming response (SSE).

    SSE = Server-Sent Events. Instead of waiting for the full
    AI response and sending it all at once, we send each word
    (token) as it's generated. This makes the UI feel alive —
    the user sees words appearing one by one, like ChatGPT does.

    The frontend listens to this stream and appends each token
    to the message bubble in real time.

    Phase 3 will replace the placeholder with:
    1. Topic classifier — is this question appropriate?
    2. Vector search — find relevant knowledge chunks
    3. Build system prompt — inject chunks + guardrails
    4. Stream OpenAI response — forward tokens to client
    5. Log to database — async, doesn't block the stream
    """

    # async def stream() defines a generator function.
    # Generators yield values one at a time instead of
    # returning everything at once — perfect for streaming.
    async def stream():
        # SSE format: each event must be "data: {content}\n\n"
        # The double newline (\n\n) tells the browser this event is complete
        # We send JSON so the frontend can parse structured data
        placeholder = "RAG service placeholder. Full AI implementation arrives in Phase 3."

        for word in placeholder.split():
            # json.dumps converts the dict to a JSON string safely
            yield f"data: {json.dumps({'token': word + ' '})}\n\n"

        # [DONE] is a sentinel value — the frontend knows to stop
        # listening when it sees this
        yield "data: [DONE]\n\n"

    # StreamingResponse tells FastAPI not to buffer the output.
    # media_type="text/event-stream" is the Content-Type header
    # that tells the browser this is an SSE stream, not normal JSON
    return StreamingResponse(stream(), media_type="text/event-stream")


@router.post("/analyze-fit")
async def analyze_fit(request: FitRequest):
    """
    Recruiter mode endpoint. NOT streaming — returns one JSON response.

    Takes a job description, analyzes it against Samuel's knowledge base,
    and returns a structured fit report with a score, evidence per
    requirement, identified gaps, and suggested interview questions.

    This is a single round-trip (not streaming) because the recruiter
    wants a complete report, not a partial one appearing word by word.

    Phase 3 will replace the placeholder with:
    1. Parse JD — extract requirements using an LLM
    2. Search knowledge base for evidence per requirement
    3. Score and structure the results
    4. Return the FitResponse JSON
    """
    return {
        "overall_score": 0,
        "summary": "Fit analysis coming in Phase 3.",
        "requirements": [],
        "gaps": [],
        "suggested_questions": []
    }