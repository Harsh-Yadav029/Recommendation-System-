from fastapi import APIRouter, HTTPException, Depends
from pymongo import UpdateOne
from app.models.schemas import Interaction
from app.db.database import db

router = APIRouter()

@router.post("/log")
async def log_interaction(interaction: Interaction):
    if not interaction.user_id and not interaction.session_id:
        raise HTTPException(status_code=400, detail="Must provide either user_id or session_id")
        
    interactions_coll = db.get_collection("interactions")
    
    # Upsert logic matching Phase 2
    key = {
        "item_id": interaction.item_id,
        "domain": interaction.domain,
        "event_type": interaction.event_type
    }
    
    # Use session_id or user_id for matching, keeping separate documents for separate sessions if user is same.
    # If user_id is provided, match on user_id. If session_id is provided, match on session_id.
    # If both are provided, match on both.
    if interaction.user_id:
        key["user_id"] = interaction.user_id
    if interaction.session_id:
        key["session_id"] = interaction.session_id
        
    doc = interaction.model_dump(exclude_none=True)
    
    update = {
        "$set": doc,
        "$inc": {"count": 1}
    }
    
    result = await interactions_coll.update_one(key, update, upsert=True)
    
    return {"status": "success", "upserted_id": str(result.upserted_id) if result.upserted_id else None}
