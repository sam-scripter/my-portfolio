# Pydantic is a data validation library.
# BaseModel means "a class whose fields are automatically
# validated and type-checked when data comes in"
from pydantic import BaseModel, Field
from typing import Optional, Literal

# Represents one message in a conversation.
# role is either "user" or "assistant" — same format
# OpenAI's API expects, so we can pass this directly
class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str

# What the frontend sends when a user types a message.
# This is the input to POST /chat
class ChatRequest(BaseModel):
    # The actual message the user typed. Max 500 chars —
    # enforced here so we never accidentally send a huge
    # string to the AI and get a surprise bill
    message: str = Field(..., max_length=500)

    # visitor = normal portfolio visitor asking about Samuel
    # recruiter = has pasted a JD, wants a fit analysis
    mode: Literal["visitor", "recruiter"] = "visitor"

    # The conversation so far — sent with every message so
    # the AI remembers context. We keep the last 6 pairs
    # (12 messages) to limit token usage
    session_history: list[Message] = []

    # Only present in recruiter mode — the pasted job description
    job_description: Optional[str] = None

# What we return from POST /chat/analyze-fit
# This is the structured fit report shown in recruiter mode
class FitRequirement(BaseModel):
    requirement: str      # e.g. "5+ years Flutter experience"
    evidence: str         # what we found in Samuel's knowledge base
    matched: bool         # True if Samuel clearly meets this

class FitResponse(BaseModel):
    overall_score: int    # 1-10
    summary: str          # one paragraph overview
    requirements: list[FitRequirement]
    gaps: list[str]       # requirements not clearly met
    suggested_questions: list[str]  # for the recruiter to ask

# Input for POST /chat/analyze-fit
class FitRequest(BaseModel):
    job_description: str

# Input for POST /ingest — used by the admin panel
# to add new content to the AI's knowledge base
class IngestRequest(BaseModel):
    # If provided: ingest this specific text content
    # If None: re-ingest all files from the knowledge/ folder
    file_content: Optional[str] = None
    source_name: Optional[str] = None  # e.g. "projects/atlas"