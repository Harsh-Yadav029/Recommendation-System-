from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class UserProfile(BaseModel):
    user_id: str
    history: List[str] = []


class Constraints(BaseModel):
    budget_max: Optional[float] = None
    category: Optional[str] = None
    tags: List[str] = []


class RankedItem(BaseModel):
    item_id: str
    score: float
    matched_constraints: List[str]
    similarity_basis: Optional[str] = None
    domain: str


class ComparisonTable(BaseModel):
    items: List[Dict[str, Any]]


class IntentResult(BaseModel):
    intent: str
    confidence: float


class Interaction(BaseModel):
    user_id: str
    item_id: str
    domain: str
    event_type: str
    value: Optional[float] = None
    timestamp: Optional[int] = None


class Item(BaseModel):
    item_id: str
    domain: str
    title: str
    category: Optional[str] = None
    price: Optional[float] = None
    metadata: Dict[str, Any] = {}
