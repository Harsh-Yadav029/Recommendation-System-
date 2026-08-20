import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import APIError

load_dotenv()
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.contracts.llm import BaseLLMClient
from app.models.schemas import (
    IntentResult,
    Constraints,
    ComparisonTable,
    RankedItem,
    UserProfile,
)
from app.core.exceptions import LLMUnavailableException

def is_retryable_error(exception):
    # Retry on 429 Too Many Requests or 503 Service Unavailable
    if isinstance(exception, APIError):
        if exception.code in (429, 503):
            return True
    return False

class GeminiClient(BaseLLMClient):
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        if not self.api_key:
            # We don't fail immediately in case it's set later, but typically it should be present.
            pass
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = "gemini-2.5-flash"

    @retry(
        retry=retry_if_exception_type(APIError),
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    def _call_gemini_structured(self, prompt: str, schema) -> str:
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=schema,
                    temperature=0.0
                )
            )
            if response.text is None:
                raise LLMUnavailableException("Model returned empty text response")
            return response.text
        except APIError as e:
            if is_retryable_error(e):
                raise e
            # If not a retryable error, don't retry, just raise immediately
            raise LLMUnavailableException(f"Non-retryable LLM error: {str(e)}")
        except Exception as e:
            raise LLMUnavailableException(f"Unexpected LLM error: {str(e)}")

    @retry(
        retry=retry_if_exception_type(APIError),
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    def _call_gemini_text(self, prompt: str) -> str:
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7
                )
            )
            if response.text is None:
                raise LLMUnavailableException("Model returned empty text response")
            return response.text
        except APIError as e:
            if is_retryable_error(e):
                raise e
            raise LLMUnavailableException(f"Non-retryable LLM error: {str(e)}")
        except Exception as e:
            raise LLMUnavailableException(f"Unexpected LLM error: {str(e)}")

    def classify_intent(self, user_message: str, history: list) -> IntentResult:
        prompt = f"""
You are an intent classification engine for an ecommerce assistant.
History: {history}
User message: "{user_message}"
Determine if the user wants to 'recommend' items, 'compare' items, or something else ('unknown').
"""
        try:
            result_json = self._call_gemini_structured(prompt, IntentResult)
            return IntentResult.model_validate_json(result_json)
        except Exception as e:
            raise LLMUnavailableException(f"Failed to classify intent: {str(e)}")

    def extract_constraints(self, user_message: str) -> Constraints:
        prompt = f"""
Extract product constraints from the user message.
User message: "{user_message}"
Extract budget_max, category, and tags if present.
"""
        try:
            result_json = self._call_gemini_structured(prompt, Constraints)
            return Constraints.model_validate_json(result_json)
        except Exception as e:
            raise LLMUnavailableException(f"Failed to extract constraints: {str(e)}")

    def format_comparison(self, comparison_data: ComparisonTable) -> str:
        prompt = f"""
Format the following structured comparison data into a helpful, conversational natural language comparison.
Do not invent any details not present in the JSON.
Data:
{comparison_data.model_dump_json()}
"""
        try:
            return self._call_gemini_text(prompt)
        except Exception as e:
            raise LLMUnavailableException(f"Failed to format comparison: {str(e)}")

    def explain_recommendation(
        self, item: RankedItem, user_profile: UserProfile
    ) -> str:
        prompt = f"""
Explain why this item was recommended.
Item data: {item.model_dump_json()}
User profile: {user_profile.model_dump_json()}

You must strictly ground your explanation in the `matched_constraints` and `similarity_basis` provided in the item data.
Do NOT fabricate a product title, category, or price if it is not explicitly provided. Do not guess.
Explain the recommendation naturally and conversationally based ONLY on the data above.
"""
        try:
            return self._call_gemini_text(prompt)
        except Exception as e:
            raise LLMUnavailableException(f"Failed to explain recommendation: {str(e)}")

