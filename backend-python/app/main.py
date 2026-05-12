from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import the routers we defined — each one is a group of related endpoints
from app.routers import chat, ingest

# Create the FastAPI application.
# These strings appear in the auto-generated docs at /docs
app = FastAPI(
    title="Samuel Shadiva — RAG Service",
    description="AI microservice powering the portfolio chat assistant",
    version="1.0.0"
)

# ── CORS Middleware ───────────────────────────────────────────────────
# CORS (Cross-Origin Resource Sharing) controls which services
# are allowed to call this API.
#
# We only allow the Fastify backend (localhost:4000) to call us.
# The browser (localhost:3000) NEVER calls this service directly —
# it always goes through Fastify first.
#
# This is intentional — it keeps the OpenAI API key server-side only.
# If the browser called this directly, the key would be exposed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────
# Attaching a router makes all its endpoints available on the app.
# chat.router adds: POST /chat, POST /chat/analyze-fit
# ingest.router adds: POST /ingest
app.include_router(chat.router)
app.include_router(ingest.router)

# ── Health Check ──────────────────────────────────────────────────────
# A simple endpoint that returns 200 OK when the service is running.
# Used by:
# - Docker to check if the container started correctly
# - The Fastify backend to verify this service is reachable
# - The GitHub Actions deploy workflow to confirm successful deploy
@app.get("/health")
async def health():
    """
    Health check endpoint.
    Verifies database connectivity and reports knowledge base status.
    Used by Docker, Fastify, and the GitHub Actions deploy workflow.
    """
    try:
        import psycopg2
        from app.config import settings
        conn = psycopg2.connect(settings.database_url)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM knowledge_chunks")
        chunk_count = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM projects")
        project_count = cur.fetchone()[0]
        cur.close()
        conn.close()
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"
        chunk_count = 0
        project_count = 0

    return {
        "status": "ok",
        "service": "backend-python",
        "database": db_status,
        "knowledge_chunks": chunk_count,
        "projects": project_count,
    }