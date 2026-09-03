import os
from fastapi import APIRouter, HTTPException, Depends, Query, Body
from app.models.schemas import UserProfile, Constraints, RecommendationResponse, ComparisonTable
from app.domains.steam_service import SteamService
from app.domains.bookcrossing_service import BookCrossingService
from typing import List

router = APIRouter()

_services = {}

def get_enabled_domains() -> List[str]:
    return [d.strip() for d in os.environ.get("ENABLED_DOMAINS", "steam,bookcrossing").split(",")]

def get_service(domain: str):
    if domain not in get_enabled_domains():
        raise HTTPException(status_code=400, detail=f"Domain '{domain}' is not supported or not enabled.")
    
    if domain not in _services:
        if domain == "steam":
            _services[domain] = SteamService()
        elif domain == "bookcrossing":
            _services[domain] = BookCrossingService()
        else:
            raise HTTPException(status_code=400, detail=f"Domain '{domain}' service not found.")
            
    return _services[domain]

@router.post("/recommend/{domain}", response_model=RecommendationResponse)
async def get_recommendations(domain: str, user_profile: UserProfile = Body(...), constraints: Constraints = Body(...)):
    service = get_service(domain)
    # The BaseRecommenderService interface assumes synchronous execution for these methods
    # We will call it directly. In a fully async world we'd use threadpools if they blocked.
    return service.get_recommendations(user_profile, constraints)

@router.post("/compare/{domain}", response_model=ComparisonTable)
async def compare(domain: str, item_ids: List[str] = Body(..., embed=True)):
    service = get_service(domain)
    return service.compare(item_ids)

@router.post("/cold-start/{domain}", response_model=RecommendationResponse)
async def cold_start_recommend(domain: str, preference_answers: dict = Body(...)):
    service = get_service(domain)
    return service.cold_start_recommend(preference_answers)
