import os
from fastapi import APIRouter, HTTPException, Body, Query
from typing import List
from datetime import datetime, timedelta
from math import radians, cos, sin, sqrt, atan2
from databases.mongo import db
from data_models.dansal_model import DansalEntry
from bson import ObjectId

dansal_router = APIRouter(prefix="/api/dansal", tags=["Dansal"])
dansal_collection = db["dansal"]

# --- Utility: Cleanup expired dansal events ---
async def remove_expired_dansal():
    today = datetime.utcnow().date()
    await dansal_collection.delete_many({
        "$expr": {
            "$lt": [{"$toDate": "$date"}, today.isoformat()]
        }
    })

# --- Endpoint: Create a new Dansal ---
@dansal_router.post("/create", response_model=dict)
async def create_dansal(entry: DansalEntry = Body(...)):
    await remove_expired_dansal()
    try:
        result = await dansal_collection.insert_one(entry.dict())
        return {"message": "Dansal created", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Utility: Haversine distance calculation ---
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))

# --- Endpoint: Get nearby Dansal events ---
@dansal_router.get("/nearby", response_model=List[DansalEntry])
async def get_nearby_dansal(lat: float = Query(...), lon: float = Query(...), max_km: float = 20):
    await remove_expired_dansal()
    try:
        all_dansal = await dansal_collection.find().to_list(length=None)
        nearby = []

        for d in all_dansal:
            loc = d.get("location", {})
            if "latitude" in loc and "longitude" in loc:
                distance = haversine(lat, lon, loc["latitude"], loc["longitude"])
                if distance <= max_km:
                    d["_id"] = str(d["_id"])  # serialize
                    nearby.append(DansalEntry(**d))
        return nearby
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
