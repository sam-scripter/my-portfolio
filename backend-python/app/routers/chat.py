"""
Chat Router
============
Two endpoints:

POST /chat
    The main chat endpoint. Returns a streaming SSE response.
    Pipeline:
        1. Topic classifier — off-topic? Return decline immediately
        2. Vector retrieval — find relevant knowledge chunks
        3. Build system prompt — inject chunks + guardrails
        4. Stream OpenAI response — forward tokens to client as SSE
        5. Log to database — async after stream completes

POST /chat/analyze-fit
    Recruiter mode fit analysis. NOT streaming — returns one JSON
    response with a structured fit report.
    Pipeline:
        1. Parse JD requirements using LLM
        2. Search knowledge base for evidence per requirement
        3. Score and structure the results
        4. Return FitResponse JSON

SSE (Server-Sent Events) format:
    Each token is sent as:    data: {"token": "Hello"}\n\n
    Stream end is signaled:   data: [DONE]\n\n
    Errors are sent as:       data: {"error": "message"}\n\n
"""

import json
import hashlib
import asyncio
from datetime import datetime
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from openai import OpenAI

from app.config import settings
from app.models.schemas import ChatRequest, FitRequest
from app.services.retriever import retrieve_context
from app.services.prompt_builder import (
    classify_topic,
    get_decline_message,
    build_system_prompt,
)

router = APIRouter(prefix="/chat", tags=["chat"])
client = OpenAI(api_key=settings.openai_api_key)


def get_db_connection():
    """Get a fresh database connection for logging."""
    import psycopg2
    return psycopg2.connect(settings.database_url)


def hash_ip(ip: str) -> str:
    """
    SHA-256 hash of the IP address.
    We never store raw IPs — only hashes.
    Even if the database is compromised, IPs cannot be reversed.
    """
    return hashlib.sha256(ip.encode()).hexdigest()


def log_chat(session_id: str, ip_hash: str, question: str,
             answer: str, mode: str, off_topic: bool):
    """
    Logs a chat exchange to the chat_logs table.
    Called after the stream completes — never blocks the response.

    This data powers the admin analytics dashboard:
    - What are visitors asking most?
    - What questions expose gaps in the knowledge base?
    - How often do jailbreak attempts occur?
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO chat_logs
                (session_id, ip_hash, question, answer, mode, off_topic)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (session_id, ip_hash, question, answer, mode, off_topic))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        # Log errors but never let logging failures affect the user
        print(f"[WARNING] Failed to log chat: {e}")


@router.post("")
async def chat(request: ChatRequest, http_request: Request):
    """
    Main chat endpoint. Returns a Server-Sent Events stream.

    The frontend connects to this endpoint and reads tokens
    as they arrive, appending each to the message bubble in real time.
    This is how ChatGPT-style streaming works.

    The full pipeline runs synchronously up to the LLM call,
    then switches to streaming for the response.
    """
    # Get client IP for logging (hashed before storage)
    client_ip = http_request.client.host if http_request.client else "unknown"
    ip_hash = hash_ip(client_ip)

    async def stream_response():
        """
        Generator function that yields SSE-formatted chunks.
        FastAPI's StreamingResponse calls this and forwards
        each yielded value to the client immediately.
        """
        full_answer = ""  # accumulate for logging after stream ends

        try:
            # ── Step 1: Topic Classification ─────────────────────────
            # Free, instant check before spending any tokens.
            # If the message is personal or a jailbreak attempt,
            # decline immediately and log it as off-topic.
            is_off_topic, category = classify_topic(request.message)

            if is_off_topic:
                decline_msg = get_decline_message(category)

                # Stream the decline message word by word
                # (same UX as a real response — avoids jarring instant text)
                for word in decline_msg.split():
                    yield f"data: {json.dumps({'token': word + ' '})}\n\n"
                    await asyncio.sleep(0.02)  # slight delay for natural feel

                yield "data: [DONE]\n\n"

                # Log the off-topic attempt
                log_chat(
                    session_id=request.session_id if hasattr(request, 'session_id') else "unknown",
                    ip_hash=ip_hash,
                    question=request.message,
                    answer=decline_msg,
                    mode=request.mode,
                    off_topic=True,
                )
                return

            # ── Step 2: Vector Retrieval ──────────────────────────────
            # Search the knowledge base for chunks relevant to the question.
            # These chunks become the AI's context — it can only answer
            # from what we retrieve here.
            context_chunks = retrieve_context(
                query=request.message,
                top_k=settings.max_context_chunks,
            )

            # ── Step 3: Build System Prompt ───────────────────────────
            # Assemble the full system prompt with guardrails,
            # mode instructions, and retrieved context.
            system_prompt = build_system_prompt(
                mode=request.mode,
                context_chunks=context_chunks,
                job_description=request.job_description,
            )

            # ── Step 4: Build Messages Array ──────────────────────────
            # OpenAI's API takes a list of messages with roles.
            # We include the session history (last N exchanges) so the
            # AI remembers the conversation context within this session.
            messages = [{"role": "system", "content": system_prompt}]

            # Add conversation history (the last 6 exchanges = 12 messages)
            # More history = more context but more tokens.
            # 6 exchanges is enough to maintain coherent conversation.
            for msg in request.session_history[-12:]:
                messages.append({"role": msg.role, "content": msg.content})

            # Add the current user message
            messages.append({"role": "user", "content": request.message})

            # ── Step 5: Stream LLM Response ───────────────────────────
            # stream=True tells OpenAI to send tokens as they're generated
            # rather than waiting for the complete response.
            stream = client.chat.completions.create(
                model=settings.openai_chat_model,
                messages=messages,
                stream=True,
                max_tokens=2000,
                temperature=0.7,  # slight creativity while staying grounded
            )

            # Forward each token to the client as an SSE event
            for chunk in stream:
                delta = chunk.choices[0].delta
                if delta.content:
                    token = delta.content
                    full_answer += token
                    # SSE format: "data: {json}\n\n"
                    yield f"data: {json.dumps({'token': token})}\n\n"

            # Signal the end of the stream
            yield "data: [DONE]\n\n"

            # ── Step 6: Log the Exchange ──────────────────────────────
            # Log AFTER streaming completes — never before.
            # We don't want logging latency to affect the user experience.
            log_chat(
                session_id=getattr(request, 'session_id', 'unknown'),
                ip_hash=ip_hash,
                question=request.message,
                answer=full_answer,
                mode=request.mode,
                off_topic=False,
            )

        except Exception as e:
            # On any error, send a user-friendly error event
            # then close the stream cleanly.
            error_msg = "I encountered an error processing your request. Please try again."
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
            yield "data: [DONE]\n\n"
            print(f"[ERROR] Chat stream error: {e}")

    return StreamingResponse(
        stream_response(),
        media_type="text/event-stream",
        headers={
            # These headers are critical for SSE to work correctly:
            "Cache-Control": "no-cache",       # don't cache the stream
            "X-Accel-Buffering": "no",         # disable Nginx buffering
            "Connection": "keep-alive",         # keep connection open
        }
    )


@router.post("/analyze-fit")
async def analyze_fit(request: FitRequest):
    """
    Recruiter mode fit analysis.

    Takes a job description, extracts requirements, searches the
    knowledge base for evidence, and returns a structured fit report.

    NOT streaming — returns a complete JSON response.
    The recruiter wants a complete report, not a partial one.
    """

    # Step 1: Extract structured requirements from the JD
    # We ask the LLM to parse the JD into a consistent format
    # so we can search for each requirement independently.
    extraction_prompt = f"""
Extract the key requirements from this job description.
Return ONLY valid JSON with this exact structure, no other text:
{{
    "role_title": "string",
    "required_skills": ["skill1", "skill2"],
    "nice_to_have": ["skill1", "skill2"],
    "experience_level": "junior|mid|senior|lead",
    "key_responsibilities": ["responsibility1", "responsibility2"],
    "remote_friendly": true or false
}}

Job Description:
{request.job_description}
"""

    extraction_response = client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=[{"role": "user", "content": extraction_prompt}],
        max_tokens=500,
        temperature=0,  # deterministic for structured extraction
    )

    # Parse the extracted requirements
    try:
        jd_data = json.loads(extraction_response.choices[0].message.content)
    except json.JSONDecodeError:
        jd_data = {
            "role_title": "Unknown Role",
            "required_skills": [],
            "nice_to_have": [],
            "experience_level": "unknown",
            "key_responsibilities": [],
            "remote_friendly": False,
        }

    # Step 2: Search knowledge base for evidence per requirement
    all_requirements = (
        jd_data.get("required_skills", []) +
        jd_data.get("key_responsibilities", [])
    )

    requirement_evidence = []
    for req in all_requirements[:8]:  # limit to 8 to control token usage
        chunks = retrieve_context(query=req, top_k=2)
        evidence_text = " ".join([c["content"][:200] for c in chunks]) if chunks else ""
        requirement_evidence.append({
            "requirement": req,
            "evidence": evidence_text,
        })

    # Step 3: Generate the fit assessment
    assessment_prompt = f"""
You are evaluating Samuel Shadiva for the role of {jd_data.get('role_title', 'Software Engineer')}.

Here is evidence from Samuel's background for each requirement:

{json.dumps(requirement_evidence, indent=2)}

Samuel's profile summary:
- 4 years Flutter/Dart (Expert), shipped 2 Play Store apps
- Python/Django backend (Proficient), FastAPI (learning)
- AI/LLM integration (Expert) — OpenAI, Gemini, autonomous agents
- Node.js/Express (Proficient) — KSG ICT Platform in production
- PostgreSQL, Docker, Oracle Cloud VPS
- MSc IT at Strathmore (part-time evenings), fully available daytime
- Based in Nairobi, Kenya (EAT UTC+3), open to remote

Return ONLY valid JSON with this exact structure:
{{
    "overall_score": <integer 1-10>,
    "summary": "<2-3 sentence overall assessment>",
    "requirements": [
        {{
            "requirement": "<requirement text>",
            "evidence": "<what in Samuel's background matches>",
            "matched": <true or false>
        }}
    ],
    "gaps": ["<gap 1>", "<gap 2>"],
    "suggested_questions": ["<question 1>", "<question 2>", "<question 3>"]
}}
"""

    assessment_response = client.chat.completions.create(
        model=settings.openai_chat_model,
        messages=[{"role": "user", "content": assessment_prompt}],
        max_tokens=1000,
        temperature=0,
    )

    try:
        result = json.loads(assessment_response.choices[0].message.content)
    except json.JSONDecodeError:
        result = {
            "overall_score": 0,
            "summary": "Unable to generate fit analysis. Please try again.",
            "requirements": [],
            "gaps": [],
            "suggested_questions": [],
        }

    return result