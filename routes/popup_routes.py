from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Body
from datetime import datetime
from bson import ObjectId
import os
import shutil
from typing import List, Optional

from fastapi.security import OAuth2PasswordBearer

from data_models.popup_model import PopupAdOut, PopupAdCreate
from databases.mongo import db

popup_router = APIRouter(prefix="/api/popup-ads", tags=["Popup Ads"])
POPUP_IMAGE_PATH = "data_sources/popup_ads"
popup_ads_collection = db["popup_ads"]
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Helper function to save image
def save_popup_image(image: UploadFile, ad_id: str) -> str:
    folder = os.path.join(POPUP_IMAGE_PATH, ad_id)
    os.makedirs(folder, exist_ok=True)
    file_path = os.path.join(folder, image.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
    return f"/{file_path}"  # or generate a public URL if serving

# 🔹 Create Popup Ad
@popup_router.post("/create", response_model=PopupAdOut)
async def create_popup_ad(
    title: str = Form(...),
    image: UploadFile = File(...),
    token: str = Depends(oauth2_scheme)
):
    now = datetime.utcnow()
    ad_doc = {
        "title": title,
        "createdAt": now,
        "updatedAt": now,
        "image_url": None
    }

    result = await popup_ads_collection.insert_one(ad_doc)
    ad_id = str(result.inserted_id)

    try:
        image_url = save_popup_image(image, ad_id)
        await popup_ads_collection.update_one(
            {"_id": result.inserted_id},
            {"$set": {"image_url": image_url}}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image saving failed: {str(e)}")

    final_doc = await popup_ads_collection.find_one({"_id": result.inserted_id})
    return {
        "adId": ad_id,
        "title": final_doc["title"],
        "image_url": final_doc.get("image_url"),
        "createdAt": final_doc["createdAt"],
        "updatedAt": final_doc["updatedAt"]
    }

# 🔹 Get All Popup Ads
@popup_router.get("/", response_model=List[PopupAdOut])
async def get_all_popup_ads(token: str = Depends(oauth2_scheme)):
    ads = []
    async for ad in popup_ads_collection.find().sort("createdAt", -1):
        ad["adId"] = str(ad["_id"])
        ads.append(PopupAdOut(**ad))
    return ads

# 🔹 Delete a Popup Ad
@popup_router.delete("/{ad_id}", response_model=dict)
async def delete_popup_ad(ad_id: str, token: str = Depends(oauth2_scheme)):
    result = await popup_ads_collection.delete_one({"_id": ObjectId(ad_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Popup Ad not found")
    return {"message": "Popup Ad deleted successfully"}
