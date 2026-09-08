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
from app.llm.claude_client import ClaudeClient
from app.core.exceptions import LLMUnavailableException

class HybridLLMClient(BaseLLMClient):
    def __init__(self):
        self.gemini = GeminiClient()
        self.groq = GroqClient()
        self.claude = ClaudeClient()

    def classify_intent(self, user_message: str, history: list) -> IntentResult:
        """
        Structured Logic: Primary is Gemini. No fallback for now since Groq JSON requires specific schema handling
        not implemented in GroqClient, but this handles the routing aspect.
        """
        try:
            return self.gemini.classify_intent(user_message, history)
        except Exception as e:
            print(f"Gemini unavailable for classify_intent: {e}. Falling back to Groq...")
            try:
                return self.groq.classify_intent(user_message, history)
            except Exception as e2:
                print(f"Groq unavailable for classify_intent: {e2}. Falling back to Claude...")
                return self.claude.classify_intent(user_message, history)

    def extract_constraints(self, user_message: str) -> Constraints:
        """
        Structured Logic: Primary is Gemini.
        """
        try:
            return self.gemini.extract_constraints(user_message)
        except Exception as e:
            print(f"Gemini unavailable for extract_constraints: {e}. Falling back to Groq...")
            try:
                return self.groq.extract_constraints(user_message)
            except Exception as e2:
                print(f"Groq unavailable for extract_constraints: {e2}. Falling back to Claude...")
                return self.claude.extract_constraints(user_message)

    def format_comparison(self, comparison_data: ComparisonTable) -> str:
        """
        Conversational Logic: Primary is Gemini. Fallback is Groq, then Claude.
        """
        try:
            print("Routing to Gemini (Primary) for format_comparison...")
            return self.gemini.format_comparison(comparison_data)
        except Exception as e:
            print(f"Gemini failed: {e}. Falling back to Groq...")
            try:
                return self.groq.format_comparison(comparison_data)
            except Exception as e2:
                print(f"Groq failed: {e2}. Falling back to Claude...")
                return self.claude.format_comparison(comparison_data)

    def explain_recommendation(self, item: RankedItem, user_profile: UserProfile) -> str:
        """
        Conversational Logic: Primary is Gemini. Fallback is Groq, then Claude.
        """
        try:
            print("Routing to Gemini (Primary) for explain_recommendation...")
            return self.gemini.explain_recommendation(item, user_profile)
        except Exception as e:
            print(f"Gemini failed: {e}. Falling back to Groq...")
            try:
                return self.groq.explain_recommendation(item, user_profile)
            except Exception as e2:
                print(f"Groq failed: {e2}. Falling back to Claude...")
                return self.claude.explain_recommendation(item, user_profile)

    def chat_about_comparison(self, items: list[dict], user_message: str | None = None) -> str:
        """
        Conversational Logic: Primary is Gemini. Fallback is Groq, then Claude.
        """
        try:
            print("Routing to Gemini (Primary) for chat_about_comparison...")
            return self.gemini.chat_about_comparison(items, user_message)
        except Exception as e:
            print(f"Gemini failed: {e}. Falling back to Groq...")
            try:
                return self.groq.chat_about_comparison(items, user_message)
            except Exception as e2:
                print(f"Groq failed: {e2}. Falling back to Claude...")
                return self.claude.chat_about_comparison(items, user_message)
