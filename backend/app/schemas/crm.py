from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class ChatMessage(BaseModel):
    role: str # "user" | "assistant" | "system"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    reply: str
    sources: List[str] = []
    suggested_questions: List[str] = []

class KnowledgeDocCreate(BaseModel):
    title: str
    content: str
    category: str = "general"

class KnowledgeDocUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None

class KnowledgeDocRead(BaseModel):
    id: int
    title: str
    content: str
    category: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

