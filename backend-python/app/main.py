from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, ingest
import os

app = FastAPI(
    title="Samuel Shadiva — RAG Service",
    description="AI microservice powering the portfolio chat assistant",
    version="1.0.0"
)

# ── CORS ──────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],  # only Fastify talks to this
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────
app.include_router(chat.router)
app.include_router(ingest.router)

# ── Health ────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "backend-python",
    }