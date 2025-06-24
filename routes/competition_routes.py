import os
import json
from typing import List
from fastapi import APIRouter, HTTPException, status, Body,Form, File, UploadFile, Depends
from pymongo import ReturnDocument

from data_models.competition_model import Competition, CreateCompetitionRequest, UpdateCompetitionRequest, AddWinnerRequest
from databases.mongo import db
from bson import ObjectId
from datetime import datetime

from services.file_upload_service import save_uploaded_images
from utils.auth.jwt_functions import get_admin_or_super

competition_router = APIRouter(prefix="/competition", tags=["Competition"])
competition_collection = db["competitions"]
# Base path for storing images
BASE_IMAGE_PATH = "data_sources/competition"

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


# --- Create a new competition with image upload ---
@competition_router.post("/", response_model=Competition, status_code=status.HTTP_201_CREATED)
async def create_competition(
        competition_json: str = Form(...),
        images: List[UploadFile] = File(None),  # Optional images
        current_user: dict = Depends(get_admin_or_super)
):
    try:
        # Parse the JSON data
        try:
            competition_data = json.loads(competition_json)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in competition_json")

        # Validate the competition data structure
        try:
            competition_request = CreateCompetitionRequest(**competition_data)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Invalid competition data: {str(e)}")

        # Prepare competition data
        data_dict = competition_request.dict()
        data_dict["createdAt"] = datetime.utcnow()
        data_dict["is_completed"] = False
        data_dict["winners"] = []
        data_dict["img_url"] = None  # Initialize as None

        # Insert competition first to get the ID
        result = await competition_collection.insert_one(data_dict)
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to create competition")
        competition_id = str(result.inserted_id)

        # Handle image upload if images are provided
        if images and len(images) > 0:
            # Create folder for this competition's images: data_sources/competition/{competition_id}
            image_folder = os.path.join(BASE_IMAGE_PATH, competition_id)
            os.makedirs(image_folder, exist_ok=True)

            # Save images and get URLs
            image_urls = save_uploaded_images(images, image_folder)

            # Store only the first image URL in imgUrl field
            first_image_url = image_urls[0] if image_urls else None

            # Update the competition with the first image URL
            await competition_collection.update_one(
                {"_id": result.inserted_id},
                {"$set": {"img_url": first_image_url}}
            )

            data_dict["img_url"] = first_image_url

        # Return the created competition
        data_dict["id"] = competition_id
        return Competition(**data_dict)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


#---Add winner---
@competition_router.post("/{competition_id}/winners", response_model=Competition)
async def add_winner(
        competition_id: str,
        winner_json: str = Form(...),
        images: List[UploadFile] = File(None),  # Optional images for winner
        current_user: dict = Depends(get_admin_or_super)
):
    try:
        # Validate ObjectId format
        if not ObjectId.is_valid(competition_id):
            raise HTTPException(status_code=400, detail="Invalid competition ID format")

        # Check if the competition exists
        existing = await competition_collection.find_one({"_id": ObjectId(competition_id)})
        if not existing:
            raise HTTPException(status_code=404, detail="Competition not found")

        # Parse the JSON data
        try:
            winner_data = json.loads(winner_json)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in winner_json")

        # Validate the winner data structure
        try:
            winner_request = AddWinnerRequest(**winner_data)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Invalid winner data: {str(e)}")

        # Prepare winner data
        winner_dict = winner_request.dict()
        winner_dict["imageUrl"] = None  # Initialize as None

        # Handle image upload if images are provided
        if images and len(images) > 0:
            # Create folder for winner images: data_sources/competition/{competition_id}/winners/{place}
            winner_folder = os.path.join(BASE_IMAGE_PATH, competition_id, "winners", str(winner_dict["place"]))
            os.makedirs(winner_folder, exist_ok=True)

            # Save images and get URLs
            image_urls = save_uploaded_images(images, winner_folder)

            # Store only the first image URL for the winner
            winner_dict["imageUrl"] = image_urls[0] if image_urls else None

        # Add winner to the competition and mark as completed
        updated = await competition_collection.find_one_and_update(
            {"_id": ObjectId(competition_id)},
            {
                "$push": {"winners": winner_dict},
                "$set": {"is_completed": True}
            },
            return_document=ReturnDocument.AFTER
        )

        if not updated:
            raise HTTPException(status_code=500, detail="Failed to add winner to competition")

        # Format and return the updated competition
        updated["id"] = str(updated["_id"])
        del updated["_id"]
        return Competition(**updated)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# --- Get all competitions ---
@competition_router.get("/", response_model=list[Competition])
async def get_all_competitions():
    competitions = []
    async for doc in competition_collection.find().sort("createdAt", -1):
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        competitions.append(Competition(**doc))
    return competitions


# --- Mark competition as completed ---
@competition_router.put("/{competition_id}/complete", response_model=Competition)
async def complete_competition(
        competition_id: str,
        current_user: dict = Depends(get_admin_or_super)
):
    try:
        # Validate ObjectId format
        if not ObjectId.is_valid(competition_id):
            raise HTTPException(status_code=400, detail="Invalid competition ID format")

        # Update competition to completed status
        updated = await competition_collection.find_one_and_update(
            {"_id": ObjectId(competition_id)},
            {"$set": {"is_completed": True}},
            return_document=ReturnDocument.AFTER
        )

        if not updated:
            raise HTTPException(status_code=404, detail="Competition not found")

        # Format and return the updated competition
        updated["id"] = str(updated["_id"])
        del updated["_id"]
        return Competition(**updated)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


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
async def update_competition(
        competition_id: str, 
        updates: UpdateCompetitionRequest,
        current_user: dict = Depends(get_admin_or_super)
):
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
async def delete_competition(
        competition_id: str,
        current_user: dict = Depends(get_admin_or_super)
):
    try:
        result = await competition_collection.delete_one({"_id": ObjectId(competition_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Competition not found")
        return
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid competition ID format")
