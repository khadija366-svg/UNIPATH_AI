from pydantic import BaseModel
from typing import List, Optional


class EligibilityResult(BaseModel):
    status: str
    passed_rules: List[str]
    failed_rules: List[str]
    missing_information: List[str]


class MeritResult(BaseModel):
    merit: Optional[float]
    breakdown: Optional[List[dict]]


class TestResult(BaseModel):
    status: str
    detail: str


class BudgetResult(BaseModel):
    status: str
    detail: str


class DeadlineResult(BaseModel):
    status: str
    date: Optional[str]
    days_remaining: Optional[int]


class Recommendation(BaseModel):
    program_id: str
    university_id: str
    university: str
    program: str
    campus: str
    city: str
    eligibility: EligibilityResult
    test_status: str
    merit: Optional[float]
    fee: Optional[float]
    budget_status: str
    deadline_status: str
    program_match: str
    match_score: float
    category: str
    confidence: str
    reasons: List[str]
    source: dict


class ProfileSummary(BaseModel):
    name: str
    matric_percentage: float
    intermediate_percentage: float
    qualification: str
    preferred_program: str
    budget: float
    location: str


class AnalysisResponse(BaseModel):
    profile_summary: ProfileSummary
    program_matches: List[dict]
    evaluations: List[dict]
    recommendations: List[Recommendation]
    deadlines: List[dict]
    stats: dict
    dataset_version: str
