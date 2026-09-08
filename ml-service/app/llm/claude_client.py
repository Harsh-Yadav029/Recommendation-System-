import os
from dotenv import load_dotenv
from anthropic import Anthropic, APIError

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
    if isinstance(exception, APIError):
        status_code = getattr(exception, 'status_code', None)
        if status_code in (429, 500, 502, 503, 504):
            return True
    return False

class ClaudeClient:
    def __init__(self):
        self.api_key = os.environ.get("ANTHROPIC_API_KEY")
        self.client = Anthropic(api_key=self.api_key) if self.api_key else None
        self.model_name = "claude-3-5-sonnet-20240620"

    @retry(
        retry=retry_if_exception_type(APIError),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=4),
        reraise=True
    )
    def _call_claude_text(self, prompt: str) -> str:
        if not self.client:
            raise LLMUnavailableException("ANTHROPIC_API_KEY is missing")
        try:
            response = self.client.messages.create(
                model=self.model_name,
                max_tokens=2048,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            block = response.content[0]
            content = getattr(block, "text", "")
            if not content:
                raise LLMUnavailableException("Model returned empty text response")
            return content
        except APIError as e:
            if is_retryable_error(e):
                raise e
            raise LLMUnavailableException(f"Non-retryable LLM error: {str(e)}")
        except Exception as e:
            raise LLMUnavailableException(f"Unexpected LLM error: {str(e)}")

    def classify_intent(self, user_message: str, history: list) -> IntentResult:
        raise NotImplementedError("Use Gemini for structured JSON tasks")

    def extract_constraints(self, user_message: str) -> Constraints:
        raise NotImplementedError("Use Gemini for structured JSON tasks")

    def format_comparison(self, comparison_data: ComparisonTable) -> str:
        prompt = f"""
Format the following structured comparison data into a helpful, conversational natural language comparison.
Do not invent any details not present in the JSON.
Data:
{comparison_data.model_dump_json()}
"""
        try:
            return self._call_claude_text(prompt)
        except Exception as e:
            raise LLMUnavailableException(f"Failed to format comparison: {str(e)}")

    def explain_recommendation(self, item: RankedItem, user_profile: UserProfile) -> str:
        prompt = f"""
Explain why this item was recommended.
Item data: {item.model_dump_json()}
User profile: {user_profile.model_dump_json()}

You must strictly ground your explanation in the `matched_constraints` and `similarity_basis` provided in the item data.
Do NOT fabricate a product title, category, or price if it is not explicitly provided. Do not guess.
Explain the recommendation naturally and conversationally based ONLY on the data above.
"""
        try:
            return self._call_claude_text(prompt)
        except Exception as e:
            raise LLMUnavailableException(f"Failed to explain recommendation: {str(e)}")

    def chat_about_comparison(self, items: list[dict], user_message: str | None = None) -> str:
        base_prompt = f"""
You are an expert comparison analyst and domain expert. You are helping a user compare the following items based on their backend audit data, metadata, and baseline scores:
{items}

Guidelines:
- Act as a domain expert.
  - If the items are books, analyze author themes, publication years, and reader demographics or ratings.
  - If the items are video games (Steam), analyze playtime, genre, and overwhelmingly positive review metrics.
- Your response must be strictly grounded in the provided item data unless the user explicitly asks for external suggestions. Do not hallucinate or invent details for the provided items.
"""
        if user_message:
            prompt = base_prompt + f"""
User's query: "{user_message}"

Answer the user's query directly, naturally, and in a highly detailed, comprehensive manner. Expand on your reasoning, provide deep insights, and take the time to thoroughly explain your thought process. If the user asks for a recommendation outside of the provided items, you may suggest new items based on your general knowledge and provide detailed reasons why they fit.
"""
        else:
            prompt = base_prompt + """
REQUIRED STRUCTURE:
You MUST format your initial summary using the following three sections in Markdown:
1. **Individual Item Breakdown**: Describe each item in its own subsection (e.g. `### [Item Title]`), highlighting its specific metrics, genre, and themes.
2. **Expert Analytics**: A `## Expert Analysis` section comparing the items directly against each other, highlighting trade-offs, similarities, and differences based on the data.
3. **Summary & Conclusion**: A `## Conclusion` section that summarizes everything into a definitive takeaway.

Provide a comprehensive and detailed side-by-side summary comparing these items. Highlight their key similarities, differences, and what makes each unique based on the provided audit data and baseline scores.
"""
        try:
            return self._call_claude_text(prompt)
        except Exception as e:
            print(f"DEBUG CLAUDE EXCEPTION: {repr(e)}")
            raise LLMUnavailableException(f"Failed to generate comparison chat: {str(e)}")
