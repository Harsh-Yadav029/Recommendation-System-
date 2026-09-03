from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.models.schemas import UserProfile, Constraints, RecommendationResponse
from app.llm.hybrid_client import HybridLLMClient
from app.core.exceptions import LLMUnavailableException
from app.api.routes.recommender import get_service

router = APIRouter()
llm_client = HybridLLMClient()

class AssistantChatRequest(BaseModel):
    domain: str
    user_profile: UserProfile
    message: str
    history: List[str] = []

class AssistantChatResponse(BaseModel):
    response: str
    data: Optional[Dict[str, Any]] = None

class CompareChatRequest(BaseModel):
    domain: str
    item_ids: List[str]
    user_message: Optional[str] = None

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
            
            # Semantic search handling
            if constraints.similar_to_title:
                matching_docs = domain_service.search_by_title(constraints.similar_to_title)
                if not matching_docs:
                    return AssistantChatResponse(
                        response=f"I couldn't find any exact matches for '{constraints.similar_to_title}'. Could you try another title?",
                        data={"error": "item_not_found"}
                    )
                
                target_item = matching_docs[0]
                target_id = target_item["item_id"]
                
                # Fetch similar items via vector search
                rec_response = domain_service.find_similar_items(target_id, k=5)
                
                if not rec_response.items:
                    return AssistantChatResponse(
                        response=f"I couldn't find semantic recommendations for '{target_item.get('title', 'that item')}'.",
                        data={"error": "no_similar_items"}
                    )
                
                # Explain the top semantic recommendation
                top_item = rec_response.items[0]
                explanation = llm_client.explain_recommendation(top_item, request.user_profile)
                
                return AssistantChatResponse(
                    response=f"I found '{target_item.get('title')}'. Based on that:\n\n{explanation}",
                    data={
                        "recommendations": rec_response.model_dump(), 
                        "constraints": constraints.model_dump(),
                        "semantic_target": target_item.get("title")
                    }
                )
                
            # Fetch standard recommendations using the deterministic ML service
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

@router.post("/compare_chat", response_model=AssistantChatResponse)
async def compare_chat(request: CompareChatRequest = Body(...)):
    domain_service = get_service(request.domain)
    
    try:
        comparison_table = domain_service.compare(request.item_ids)
        # Convert items to list of dicts for the prompt
        items = comparison_table.items
        
        response_text = llm_client.chat_about_comparison(items, request.user_message)
        
        return AssistantChatResponse(
            response=response_text,
            data={"items_compared": request.item_ids}
        )
    except LLMUnavailableException as e:
        print(f"LLM Unavailable: {e}")
        return AssistantChatResponse(
            response="The AI assistant is currently unavailable.",
            data={"error": "llm_unavailable"}
        )
    except Exception as e:
        print(f"Error in compare_chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))
