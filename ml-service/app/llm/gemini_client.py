from app.contracts.llm import BaseLLMClient
from app.models.schemas import (
    IntentResult,
    Constraints,
    ComparisonTable,
    RankedItem,
    UserProfile,
)


class GeminiClient(BaseLLMClient):
    def classify_intent(self, user_message: str, history: list) -> IntentResult:
        raise NotImplementedError("classify_intent not implemented")

    def extract_constraints(self, user_message: str) -> Constraints:
        raise NotImplementedError("extract_constraints not implemented")

    def format_comparison(self, comparison_data: ComparisonTable) -> str:
        raise NotImplementedError("format_comparison not implemented")

    def explain_recommendation(
        self, item: RankedItem, user_profile: UserProfile
    ) -> str:
        raise NotImplementedError("explain_recommendation not implemented")
