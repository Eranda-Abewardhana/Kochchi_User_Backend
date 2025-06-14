from fastapi import APIRouter, HTTPException, status

from data_models.competition_model import Competition, CreateCompetitionRequest, UpdateCompetitionRequest
from databases.mongo import db
from bson import ObjectId
from datetime import datetime

competition_router = APIRouter(prefix="/api/competition", tags=["Competition"])
competition_collection = db["competitions"]

# --- Create competition ---
@competition_router.post("/", response_model=Competition, status_code=status.HTTP_201_CREATED)
async def create_competition(data: CreateCompetitionRequest):
    data_dict = data.dict()
    data_dict["img_url"] = str(data_dict["img_url"]) if data_dict.get("img_url") else None
    data_dict["createdAt"] = datetime.utcnow()

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
