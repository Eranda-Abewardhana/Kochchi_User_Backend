from typing import List

from fastapi import APIRouter, HTTPException, status, Body
from pymongo import ReturnDocument

from data_models.competition_model import Competition, CreateCompetitionRequest, UpdateCompetitionRequest, \
    AddWinnersRequest, Winner
from databases.mongo import db
from bson import ObjectId
from datetime import datetime

competition_router = APIRouter(prefix="/api/competition", tags=["Competition"])
competition_collection = db["competitions"]

# ---Get not completed competitions---
@competition_router.get("/not-completed", response_model=List[Competition])
async def get_not_completed_competitions():
    """
    Get competitions that are not completed.
    A competition is considered not completed if:
    - is_completed is False OR
    - winners array is empty
    """
    competitions = await competition_collection.find({
        "$or": [
            {"is_completed": False},
            {"winners": {"$exists": False}},
            {"winners": {"$size": 0}}
        ]
    }).to_list(length=None)

    # Format the competitions
    formatted_competitions = []
    for competition in competitions:
        competition["id"] = str(competition["_id"])
        del competition["_id"]
        formatted_competitions.append(Competition(**competition))

    return formatted_competitions

# ---Get completed competitions---
@competition_router.get("/completed", response_model=List[Competition])
async def get_completed_competitions():
    """
    Get competitions that are completed.
    """
    competitions = await competition_collection.find({
        "$and": [
            {"is_completed": True},
            {"winners": {"$exists": True}},
            {"winners": {"$not": {"$size": 0}}}
        ]
    }).to_list(length=None)

    # Format the competitions
    formatted_competitions = []
    for competition in competitions:
        competition["id"] = str(competition["_id"])
        del competition["_id"]
        formatted_competitions.append(Competition(**competition))

    return formatted_competitions

# --- Create competition ---
@competition_router.post("/", response_model=Competition, status_code=status.HTTP_201_CREATED)
async def create_competition(data: CreateCompetitionRequest):
    data_dict = data.dict()
    data_dict["img_url"] = str(data_dict["img_url"]) if data_dict.get("img_url") else None
    data_dict["createdAt"] = datetime.utcnow()
    data_dict["is_completed"] = False
    data_dict["winners"] = []

    result = await competition_collection.insert_one(data_dict)
    if result.inserted_id:
        data_dict["id"] = str(result.inserted_id)
        return Competition(**data_dict)
    raise HTTPException(status_code=500, detail="Failed to create competition")


# --- Get all competitions ---
@competition_router.get("/", response_model=list[Competition])
async def get_all_competitions():
    competitions = []
    async for doc in competition_collection.find().sort("createdAt", -1):
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        competitions.append(Competition(**doc))
    return competitions

#---Add winners for competition---
@competition_router.put("/{competition_id}/winners", response_model=Competition)
async def add_winners(competition_id: str, data: AddWinnersRequest = Body(...)):
    # Step 1: Validate ObjectId format
    if not ObjectId.is_valid(competition_id):
        raise HTTPException(status_code=400, detail="Invalid competition ID format")

    # Step 2: Check if the competition exists
    existing = await competition_collection.find_one({"_id": ObjectId(competition_id)})
    if not existing:
        raise HTTPException(status_code=404, detail="Competition not found")

    # Step 3: Prepare the winners data and convert HttpUrl to string
    winners_data = []
    for winner in data.winners:
        winner_dict = winner.dict()
        # Convert HttpUrl to string for MongoDB compatibility
        if winner_dict.get("imageUrl"):
            winner_dict["imageUrl"] = str(winner_dict["imageUrl"])
        winners_data.append(winner_dict)

    # Step 4: Update the competition with winners and mark as completed
    updated = await competition_collection.find_one_and_update(
        {"_id": ObjectId(competition_id)},
        {"$set": {
            "winners": winners_data,
            "is_completed": True
        }},
        return_document=ReturnDocument.AFTER
    )

    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update competition")

    # Step 5: Format and return the updated competition
    updated["id"] = str(updated["_id"])
    del updated["_id"]
    return Competition(**updated)

# --- Get competition by ID ---
@competition_router.get("/{competition_id}", response_model=Competition)
async def get_competition_by_id(competition_id: str):
    try:
        doc = await competition_collection.find_one({"_id": ObjectId(competition_id)})
        if doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            return Competition(**doc)
        raise HTTPException(status_code=404, detail="Competition not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid competition ID format")

# --- Update competition ---
@competition_router.put("/{competition_id}", response_model=Competition)
async def update_competition(competition_id: str, updates: UpdateCompetitionRequest):
    try:
        update_data = updates.dict(exclude_unset=True)
        if "img_url" in update_data:
            update_data["img_url"] = str(update_data["img_url"])

        result = await competition_collection.find_one_and_update(
            {"_id": ObjectId(competition_id)},
            {"$set": update_data},
            return_document=True
        )

        if result:
            result["id"] = str(result["_id"])
            del result["_id"]
            return Competition(**result)
        raise HTTPException(status_code=404, detail="Competition not found")

    except Exception:
        raise HTTPException(status_code=400, detail="Invalid competition ID or update failed")



# --- Delete competition ---
@competition_router.delete("/{competition_id}", status_code=204)
async def delete_competition(competition_id: str):
    try:
        result = await competition_collection.delete_one({"_id": ObjectId(competition_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Competition not found")
        return
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid competition ID format")
