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
    return {
        "status": "ok",
        "service": "backend-python",
        # Phase 3 will add: "database": "ok/error" and "chunks_loaded": N
    }