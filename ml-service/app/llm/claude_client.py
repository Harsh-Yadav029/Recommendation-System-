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

    def explain_recommendation(
        self, item: RankedItem, user_profile: UserProfile
    ) -> str:
        prompt = f"""
Explain why this item was recommended.
Item data: {item.model_dump_json()}
User profile: {user_profile.model_dump_json()}

You must strictly ground your explanation in the `matched_constraints` and `similarity_basis` provided in the item data.
Do NOT fabricate a product title, category, or price if it is not explicitly provided. Do not guess.

REQUIRED STRUCTURE:
1. **Item Details**: Provide a detailed breakdown of the item using *only* available fields from the JSON. If a field is missing, state plainly that it is not specified.
2. **Summary**: A short synthesis explaining why this item is a good fit. Do not invent any new details or claims not present in the data.
"""
        try:
            return self._call_claude_text(prompt)
        except Exception as e:
            raise LLMUnavailableException(f"Failed to explain recommendation: {str(e)}")

    def chat_about_comparison(self, items: list[dict], user_message: str | None = None) -> str:
        base_prompt = f"""
You are an assistant helping a user compare items.
Here are the items being compared:
{items}

Guidelines:
- Only discuss the fields explicitly provided below.
- The real fields present in the ComparisonTable data might include title, author, year, publisher, popularity_score, similarity_basis, etc. depending on the domain.
- If a field is not provided, do not mention it, invent it, or guess a value — do not discuss ratings, categories, review counts, or any other attribute not explicitly listed here.
"""
        if user_message:
            prompt = base_prompt + f"""
User's query: "{user_message}"

Answer the user's query directly and naturally based ONLY on the provided data.
"""
        else:
            prompt = base_prompt + """
REQUIRED STRUCTURE:
You MUST format your initial summary using the following three sections in Markdown:
1. **Individual Item Breakdown**: Describe each item in its own subsection (e.g. `### [Item Title]`). Only use real fields provided in the JSON data. If a field is missing, state plainly that it is not specified. Do not invent details, ratings, genres, or descriptions.
2. **Analysis**: A `## Analysis` section comparing the items directly against each other, highlighting trade-offs, similarities, and differences strictly based on the provided data.
3. **Conclusion**: A `## Conclusion` section that summarizes the comparison.

Provide a clear side-by-side summary comparing these items based ONLY on the provided data.
"""
        try:
            return self._call_claude_text(prompt)
        except Exception as e:
            print(f"DEBUG CLAUDE EXCEPTION: {repr(e)}")
            raise LLMUnavailableException(f"Failed to generate comparison chat: {str(e)}")
