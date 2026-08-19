from typing import Protocol
from app.models.schemas import (
    IntentResult,
    Constraints,
    ComparisonTable,
    RankedItem,
    UserProfile,
)


class BaseLLMClient(Protocol):
    def classify_intent(self, user_message: str, history: list) -> IntentResult: ...

    def extract_constraints(self, user_message: str) -> Constraints: ...

    def format_comparison(self, comparison_data: ComparisonTable) -> str: ...

    def explain_recommendation(
        self, item: RankedItem, user_profile: UserProfile
    ) -> str: ...
