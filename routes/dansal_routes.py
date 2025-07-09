import json
import os
from fastapi import APIRouter, HTTPException, Body, Query, Depends, UploadFile, Form, File
from typing import List, Optional, Annotated
from datetime import datetime, timedelta
from math import radians, cos, sin, sqrt, atan2

from fastapi.security import OAuth2PasswordBearer
from starlette import status

from databases.mongo import db
from data_models.dansal_model import DansalEntry, DansalRequestModel
from bson import ObjectId

from services.distance_radius_calculator import calculate_distance
from services.file_upload_service import save_uploaded_images
from utils.auth.jwt_functions import get_current_user
from utils.examples.ads import ads_description
from utils.examples.dansal import dansal_description

dansal_router = APIRouter(prefix="/dansal", tags=["Dansal"])
dansal_collection = db["dansal"]
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Base image directory
BASE_IMAGE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data_sources", "dansal_img"))

# --- Endpoint: Create a new Dansal ---
@dansal_router.post(
    "/create",
    response_model=dict,
    description=dansal_description,
    summary="Create a new Dansal event with images and JSON data",
    responses={
        400: {"description": "Bad request"},
        401: {"description": "Unauthorized"},
        422: {"description": "Validation error"},
        500: {"description": "Internal server error"},
    },
    status_code=status.HTTP_201_CREATED
)
@dansal_router.post("/dansal/create")
async def create_dansal(
    data: Annotated[str, Form(...)],
    images: Optional[List[UploadFile]] = File(None),
    current_user: dict = Depends(get_current_user)
):
    try:
        entry_data = json.loads(data)
        validated = DansalRequestModel(**entry_data)   # Validate with Pydantic
        payload = DansalEntry(**validated.dict())

        result = await dansal_collection.insert_one(payload.dict())
        dansal_id = str(result.inserted_id)

        image_urls = []
        if images:
            image_urls = save_uploaded_images(images, cloud_folder=f"dansals/{dansal_id}")
            await dansal_collection.update_one(
                {"_id": ObjectId(dansal_id)},
                {"$set": {"images": image_urls}}
            )

        return {
            "message": "Dansal created",
            "id": dansal_id,
            "images": image_urls
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in 'data' field")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Endpoint: Get nearby Dansal events ---
@dansal_router.get("/nearby", response_model=List[DansalEntry])
async def get_nearby_dansal(lat: float = Query(...), lon: float = Query(...), max_km: float = 20):
    try:
        all_dansal = await dansal_collection.find().to_list(length=None)
        nearby = []

        for d in all_dansal:
            loc = d.get("location", {})
            if "latitude" in loc and "longitude" in loc:
                distance = calculate_distance(lat, lon, loc["latitude"], loc["longitude"])
                if distance <= max_km:
                    d["_id"] = str(d["_id"])  # serialize
                    nearby.append(DansalEntry(**d))
        return nearby
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@dansal_router.get("/all", response_model=List[DansalEntry], summary="Get all Dansal events", description="Returns all Dansal events without any filters.")
async def get_all_dansal():
    try:
        all_dansal = await dansal_collection.find().to_list(length=None)
        for d in all_dansal:
            d["_id"] = str(d["_id"])
        return [DansalEntry(**d) for d in all_dansal]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@dansal_router.get("/my", response_model=List[DansalEntry], summary="Get my Dansal events", description="Returns all Dansal events created by the authorized user.")
async def get_my_dansal(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("user_id")
    all_dansal = await dansal_collection.find({"userId": user_id}).to_list(length=None)
    for d in all_dansal:
        d["_id"] = str(d["_id"])
    return [DansalEntry(**d) for d in all_dansal]

@dansal_router.delete("/delete/{dansal_id}", response_model=dict, summary="Delete a Dansal event", description="Delete a Dansal event by ID. Any authenticated user can delete.")
async def delete_dansal(dansal_id: str, current_user: dict = Depends(get_current_user)):
    dansal = await dansal_collection.find_one({"_id": ObjectId(dansal_id)})
    if not dansal:
        raise HTTPException(status_code=404, detail="Dansal not found")
    await dansal_collection.delete_one({"_id": ObjectId(dansal_id)})
    return {"message": "Dansal deleted successfully"}
