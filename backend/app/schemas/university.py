from pydantic import BaseModel
from typing import List, Optional


class Eligibility(BaseModel):
    minimum_matric: Optional[float]
    minimum_intermediate: Optional[float]
    accepted_groups: List[str]
    required_subjects: List[str]


class Tests(BaseModel):
    required: bool
    accepted_tests: List[str]
    minimum_score: Optional[float]


class Fees(BaseModel):
    amount: Optional[float]
    period: Optional[str]
    currency: str = "PKR"


class Source(BaseModel):
    url: Optional[str]
    type: str
    verified_at: Optional[str]
    academic_session: str
    confidence: str


class Program(BaseModel):
    program_id: str
    university_id: str
    university_name: str
    campus: str
    city: str
    name: str
    normalized_name: str
    eligibility: Eligibility
    tests: Tests
    merit_formula: dict
    fees: Fees
    deadline: Optional[str]
    deadline_status: Optional[str]
    source: Source


class University(BaseModel):
    university_id: str
    name: str
    campus: str
    city: str
    admission_cycle: str
    source: Source
    programs: List[Program]
