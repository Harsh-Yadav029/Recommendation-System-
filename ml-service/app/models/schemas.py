from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class UserProfile(BaseModel):
    user_id: str
    history: List[str] = []


class Constraints(BaseModel):
    budget_max: Optional[float] = None
    category: Optional[str] = None
    tags: List[str] = []
    similar_to_item: Optional[str] = None
    similar_to_title: Optional[str] = None


class RankedItem(BaseModel):
    item_id: str
    score: float
    matched_constraints: List[str]
    similarity_basis: Optional[str] = None
    domain: str
    title: Optional[str] = None
    metadata: Dict[str, Any] = {}


class RecommendationResponse(BaseModel):
    items: List[RankedItem]
    relaxed: bool = False
    relaxed_constraint: Optional[str] = None


class ComparisonTable(BaseModel):
    items: List[Dict[str, Any]]


class IntentResult(BaseModel):
    intent: str
    confidence: float


from typing import Literal

class Interaction(BaseModel):
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    item_id: str
    domain: str
    event_type: Literal["view", "cart", "purchase", "rating", "play", "compare_select", "click", "cold_start_answer"]
    value: Optional[float] = None
    timestamp: Optional[int] = None


class Item(BaseModel):
    item_id: str
    domain: str
    title: str
    category: Optional[str] = None
    price: Optional[float] = None
    metadata: Dict[str, Any] = {}
