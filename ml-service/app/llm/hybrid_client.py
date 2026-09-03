import traceback
from app.contracts.llm import BaseLLMClient
from app.models.schemas import (
    IntentResult,
    Constraints,
    ComparisonTable,
    RankedItem,
    UserProfile,
)
from app.llm.gemini_client import GeminiClient
from app.llm.groq_client import GroqClient
from app.core.exceptions import LLMUnavailableException

class HybridLLMClient(BaseLLMClient):
    def __init__(self):
        self.gemini = GeminiClient()
        self.groq = GroqClient()

    def classify_intent(self, user_message: str, history: list) -> IntentResult:
        """
        Structured Logic: Primary is Gemini. No fallback for now since Groq JSON requires specific schema handling
        not implemented in GroqClient, but this handles the routing aspect.
        """
        try:
            return self.gemini.classify_intent(user_message, history)
        except LLMUnavailableException as e:
            print(f"Gemini unavailable for classify_intent: {e}")
            raise e

    def extract_constraints(self, user_message: str) -> Constraints:
        """
        Structured Logic: Primary is Gemini.
        """
        try:
            return self.gemini.extract_constraints(user_message)
        except LLMUnavailableException as e:
            print(f"Gemini unavailable for extract_constraints: {e}")
            raise e

    def format_comparison(self, comparison_data: ComparisonTable) -> str:
        """
        Conversational Logic: Primary is Groq. Fallback is Gemini.
        """
        try:
            print("Routing to Groq (Primary) for format_comparison...")
            return self.groq.format_comparison(comparison_data)
        except Exception as e:
            print(f"Groq failed: {e}. Falling back to Gemini...")
            return self.gemini.format_comparison(comparison_data)

    def explain_recommendation(self, item: RankedItem, user_profile: UserProfile) -> str:
        """
        Conversational Logic: Primary is Groq. Fallback is Gemini.
        """
        try:
            print("Routing to Groq (Primary) for explain_recommendation...")
            return self.groq.explain_recommendation(item, user_profile)
        except Exception as e:
            print(f"Groq failed: {e}. Falling back to Gemini...")
            return self.gemini.explain_recommendation(item, user_profile)

    def chat_about_comparison(self, items: list[dict], user_message: str | None = None) -> str:
        """
        Conversational Logic: Primary is Groq. Fallback is Gemini.
        """
        try:
            print("Routing to Groq (Primary) for chat_about_comparison...")
            return self.groq.chat_about_comparison(items, user_message)
        except Exception as e:
            print(f"Groq failed: {e}. Falling back to Gemini...")
            return self.gemini.chat_about_comparison(items, user_message)
