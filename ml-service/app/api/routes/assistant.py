from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.models.schemas import UserProfile, Constraints, RecommendationResponse
from app.llm.gemini_client import GeminiClient
from app.core.exceptions import LLMUnavailableException
from app.api.routes.recommender import get_service

router = APIRouter()
llm_client = GeminiClient()

class AssistantChatRequest(BaseModel):
    domain: str
    user_profile: UserProfile
    message: str
    history: List[str] = []

class AssistantChatResponse(BaseModel):
    response: str
    data: Optional[Dict[str, Any]] = None

@router.post("/chat", response_model=AssistantChatResponse)
async def chat(request: AssistantChatRequest = Body(...)):
    domain_service = get_service(request.domain)
    
    try:
        # Step 1: Classify Intent
        intent_res = llm_client.classify_intent(request.message, request.history)
        
        # Step 2: Route based on intent
        if intent_res.intent == 'recommend':
            # Extract constraints
            constraints = llm_client.extract_constraints(request.message)
            
            # Fetch recommendations using the deterministic ML service
            rec_response = domain_service.get_recommendations(request.user_profile, constraints)
            
            if not rec_response.items:
                return AssistantChatResponse(
                    response="I couldn't find any recommendations matching those constraints.",
                    data={"recommendations": rec_response.model_dump()}
                )
                
            # Explain the top recommendation
            top_item = rec_response.items[0]
            explanation = llm_client.explain_recommendation(top_item, request.user_profile)
            
            return AssistantChatResponse(
                response=explanation,
                data={"recommendations": rec_response.model_dump(), "constraints": constraints.model_dump()}
            )
            
        elif intent_res.intent == 'compare':
            # For simplicity in this E2E pass, just acknowledge it. 
            # (Comparing requires extracting item IDs which wasn't heavily specified yet)
            return AssistantChatResponse(
                response="You'd like to compare items. Please use the Browse interface to select items to compare."
            )
        else:
            return AssistantChatResponse(
                response="I'm not sure how to help with that. Try asking for a recommendation!"
            )
            
    except LLMUnavailableException as e:
        # Graceful degradation fallback
        print(f"LLM Unavailable: {e}")
        return AssistantChatResponse(
            response="The assistant is currently overloaded or unavailable. Please use the Browse/Compare features directly.",
            data={"error": "llm_unavailable"}
        )
