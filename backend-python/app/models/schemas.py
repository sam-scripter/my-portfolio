from pydantic import BaseModel
from typing import Optional, Literal

class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    message: str
    mode: Literal["visitor", "recruiter"] = "visitor"
    session_history: list[Message] = []
    job_description: Optional[str] = None

class ChatResponse(BaseModel):
    content: str
    off_topic: bool = False

class FitRequest(BaseModel):
    job_description: str

class IngestRequest(BaseModel):
    file_content: Optional[str] = None
    source_name: Optional[str] = None