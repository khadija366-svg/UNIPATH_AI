from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

from app.services.test_service import get_test_total


class TestScore(BaseModel):
    name: str
    total: float = Field(..., gt=0)
    score: float = Field(..., ge=0)

    @field_validator('total')
    @classmethod
    def total_matches_config(cls, v: float, info) -> float:
        values = info.data
        name = values.get('name')
        expected = get_test_total(name)
        if expected is not None and v != expected:
            raise ValueError(f'{name} total marks must be {expected}')
        return v

    @field_validator('score')
    @classmethod
    def score_not_exceed_total(cls, v: float, info) -> float:
        values = info.data
        total = values.get('total')
        if total is not None and v > total:
            raise ValueError('Score cannot exceed total')
        return v


class StudentProfile(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    matric_percentage: float = Field(..., ge=0, le=100)
    intermediate_percentage: float = Field(..., ge=0, le=100)
    qualification: str = Field(..., min_length=1)
    subjects: Optional[List[str]] = []
    tests: Optional[List[TestScore]] = []
    preferred_program: str = Field(..., min_length=1)
    budget: float = Field(..., ge=0)
    location: Optional[str] = "Lahore"
    preferred_universities: Optional[List[str]] = []
    preferred_campus: Optional[str] = None
