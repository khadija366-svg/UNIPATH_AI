from pydantic import BaseModel
from typing import Optional, Any


class CounselorRequest(BaseModel):
    message: str
    profile: Optional[Any] = {}
    context: Optional[Any] = {}


class CounselorResponse(BaseModel):
    response: str
    badges: list
    intent: Optional[str] = None
