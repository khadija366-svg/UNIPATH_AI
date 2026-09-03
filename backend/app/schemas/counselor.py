from pydantic import BaseModel, Field
from typing import List, Optional, Any


class CounselorRequest(BaseModel):
    message: str = Field(min_length=1)
    conversation_id: Optional[str] = None
    profile: Optional[Any] = Field(default_factory=dict)
    context: Optional[Any] = Field(default_factory=dict)
    history: List[dict] = Field(default_factory=list)


class CounselorResponse(BaseModel):
    response: str
    badges: list
    intent: Optional[str] = None
    success: bool = True
    conversation_id: Optional[str] = None
    sources: List[dict] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)
