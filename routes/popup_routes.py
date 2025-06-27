from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from datetime import datetime
from bson import ObjectId
import os
from typing import List, Optional

from fastapi.security import OAuth2PasswordBearer

from data_models.popup_model import PopupAdOut, PopupAdCreate
from databases.mongo import db
from utils.auth.jwt_functions import get_admin_or_super
from services.file_upload_service import save_uploaded_images

popup_router = APIRouter(prefix="/popup-ads", tags=["Popup Ads"])
POPUP_IMAGE_PATH = "data_sources/popup_ads"
popup_ads_collection = db["popup_ads"]
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# 🔹 Create Popup Ad
@popup_router.post("/create", response_model=PopupAdOut, status_code=status.HTTP_201_CREATED)
async def create_popup_ad(
    title: str = Form(...),
    image: UploadFile = File(...),
    current_user: dict = Depends(get_admin_or_super)
):
    try:
        now = datetime.utcnow()
        ad_doc = {
            "title": title,
            "createdAt": now,
            "updatedAt": now,
            "image_url": None
        }

        # Insert popup ad first to get the ID
        result = await popup_ads_collection.insert_one(ad_doc)
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to create popup ad")

        ad_id = str(result.inserted_id)

        # Handle image upload
        try:
            # Create folder for this popup ad's image
            image_folder = os.path.join(POPUP_IMAGE_PATH, ad_id)
            os.makedirs(image_folder, exist_ok=True)

            # Save image and get URL using the file upload service
            image_urls = save_uploaded_images([image], image_folder)
            image_url = image_urls[0] if image_urls else None

            # Update the popup ad with the image URL
            await popup_ads_collection.update_one(
                {"_id": result.inserted_id},
                {"$set": {"image_url": image_url}}
            )

            ad_doc["image_url"] = image_url

        except Exception as e:
            # If image upload fails, still return the popup ad without image
            print(f"Image upload failed: {str(e)}")

        # Return the created popup ad
        ad_doc["adId"] = ad_id
        return PopupAdOut(**ad_doc)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# 🔹 Get All Popup Ads
@popup_router.get("/", response_model=List[PopupAdOut])
async def get_all_popup_ads():
    ads = []
    async for ad in popup_ads_collection.find().sort("createdAt", -1):
        ad["adId"] = str(ad["_id"])
        del ad["_id"]
        ads.append(PopupAdOut(**ad))
    return ads

# 🔹 Delete a Popup Ad
@popup_router.delete("/{ad_id}", status_code=204)
async def delete_popup_ad(
    ad_id: str, 
    current_user: dict = Depends(get_admin_or_super)
):
    try:
        result = await popup_ads_collection.delete_one({"_id": ObjectId(ad_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Popup Ad not found")
        return
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid popup ad ID format")
