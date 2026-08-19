from typing import Protocol, List
from app.models.schemas import UserProfile, Constraints, RankedItem, ComparisonTable


class BaseRecommenderService(Protocol):
    def get_recommendations(
        self, user_profile: UserProfile, constraints: Constraints
    ) -> List[RankedItem]: ...

    def compare(self, item_ids: List[str]) -> ComparisonTable: ...

    def cold_start_recommend(self, preference_answers: dict) -> List[RankedItem]: ...

    def explain(self, item_id: str, user_profile: UserProfile) -> str: ...
