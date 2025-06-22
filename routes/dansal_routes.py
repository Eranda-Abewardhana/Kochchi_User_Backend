import json
import os
from fastapi import APIRouter, HTTPException, Body, Query, Depends, UploadFile, Form, File
from typing import List, Optional
from datetime import datetime, timedelta
from math import radians, cos, sin, sqrt, atan2

from fastapi.security import OAuth2PasswordBearer

from databases.mongo import db
from data_models.dansal_model import DansalEntry, DansalRequestModel
from bson import ObjectId

from services.distance_radius_calculator import calculate_distance
from services.file_upload_service import save_uploaded_images

dansal_router = APIRouter(prefix="/api/dansal", tags=["Dansal"])
dansal_collection = db["dansal"]
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Base image directory
BASE_IMAGE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data_sources", "dansal_img"))

# --- Endpoint: Create a new Dansal ---
@dansal_router.post("/create", response_model=dict)
async def create_dansal(
    payload: DansalRequestModel,
    data: str = Form(...),                          # JSON string
    images: Optional[List[UploadFile]] = File(None), # Uploaded files
    token: str = Depends(oauth2_scheme)
):
    try:
        # Parse JSON string to model
        entry_data = json.loads(data)
        payload = DansalEntry(**entry_data)

        # Insert initial data without images
        result = await dansal_collection.insert_one(payload.dict())
        dansal_id = str(result.inserted_id)

        # Save images if any
        if images:
            # Create folder for this dansal entry
            dansal_folder = os.path.join(BASE_IMAGE_PATH, dansal_id)
            os.makedirs(dansal_folder, exist_ok=True)

            image_urls = save_uploaded_images(images, dansal_folder)

            # Update the DB with image URLs
            await dansal_collection.update_one(
                {"_id": ObjectId(dansal_id)},
                {"$set": {"images": image_urls}}
            )

        return {"message": "Dansal created", "id": dansal_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Endpoint: Get nearby Dansal events ---
@dansal_router.get("/nearby", response_model=List[DansalEntry])
async def get_nearby_dansal(lat: float = Query(...), lon: float = Query(...), max_km: float = 20, token: str = Depends(oauth2_scheme)):
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
