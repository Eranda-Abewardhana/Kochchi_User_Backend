import os
import shutil
import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from typing import List
from bson import ObjectId
from datetime import datetime
from databases.mongo import db
from data_models.ads_model import (
    AdCreateResponse,
    AdDeleteResponse,
    AdApprovalResponse,
    ErrorResponse
)
from services.file_upload_service import save_uploaded_images
from fastapi.security import OAuth2PasswordBearer
from utils.auth.jwt_functions import decode_token

ads_router = APIRouter(prefix="/api/ads", tags=["Ads"])

ads_collection = db["ads"]
approvals_collection = db["admin_approvals"]
BASE_IMAGE_PATH = "data_sources"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

@ads_router.post(
    "/create",
    response_model=AdCreateResponse,
    responses={400: {"model": ErrorResponse}, 422: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def create_ad(ad_json: str = Form(...), images: List[UploadFile] = File(...)):
    try:
        ad_data = json.loads(ad_json)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON in ad_json")

    try:
        ad_data.update({
            "approval": {
                "status": "pending",
                "adminId": None,
                "adminComment": None,
                "approvedAt": None,
            },
            "reactions": {
                "likes": {"count": 0, "userIds": []},
                "unlikes": {"count": 0, "userIds": []}
            },
            "visibility": "hidden",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        })

        result = await ads_collection.insert_one(ad_data)
        ad_id = str(result.inserted_id)

        image_folder = os.path.join(BASE_IMAGE_PATH, ad_id)
        os.makedirs(image_folder, exist_ok=True)

        image_urls = save_uploaded_images(images, image_folder)

        await ads_collection.update_one({"_id": result.inserted_id}, {"$set": {"images": image_urls}})

        return {"message": "Ad created successfully", "adId": ad_id, "images": image_urls}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@ads_router.delete(
    "/{ad_id}",
    response_model=AdDeleteResponse,
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def delete_ad(ad_id: str):
    try:
        obj_id = ObjectId(ad_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ad ID format")

    result = await ads_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ad not found")

    try:
        image_folder = os.path.join(BASE_IMAGE_PATH, ad_id)
        if os.path.exists(image_folder):
            shutil.rmtree(image_folder)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete image folder: {str(e)}")

    return {"message": "Ad deleted successfully"}


@ads_router.post(
    "/{ad_id}/approve",
    response_model=AdApprovalResponse,
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def approve_ad(ad_id: str, admin_id: str = Form(...), status: str = Form(...), comment: str = Form(None)):
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be either 'approved' or 'rejected'")

    try:
        obj_id = ObjectId(ad_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ad ID format")

    update_data = {
        "approval.status": status,
        "approval.adminId": admin_id,
        "approval.adminComment": comment,
        "approval.approvedAt": datetime.utcnow(),
        "visibility": "visible" if status == "approved" else "hidden",
        "updatedAt": datetime.utcnow()
    }

    result = await ads_collection.update_one({"_id": obj_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="No ad found to approve/reject")

    try:
        await approvals_collection.insert_one({
            "admin_id": admin_id,
            "ad_id": ad_id,
            "approved_at": datetime.utcnow(),
            "status": status
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Approval logging failed: {str(e)}")

    return {"message": f"Ad {status} successfully"}


@ads_router.get("/approve")
async def get_approved_ads():
    ads = await ads_collection.find({"approval.status": "approved"}).to_list(100)
    result = [
        {
            "shopId": str(ad["_id"]),
            "shopName": ad["shopName"],
            "city": ad["location"]["city"],
            "image": ad["images"][0] if ad.get("images") else None
        }
        for ad in ads
    ]
    return result


@ads_router.get("/my", responses={401: {"model": ErrorResponse}})
async def get_my_ads(token: str = Depends(oauth2_scheme)):
    try:
        email = decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    ads = await ads_collection.find({"contact.email": email}).to_list(100)
    return [
        {
            "shopId": str(ad["_id"]),
            "shopName": ad["shopName"],
            "city": ad["location"]["city"],
            "image": ad["images"][0] if ad.get("images") else None
        }
        for ad in ads
    ]


@ads_router.get("/{ad_id}", responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}})
async def get_ad_details(ad_id: str):
    try:
        obj_id = ObjectId(ad_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ad ID")

    ad = await ads_collection.find_one({"_id": obj_id})
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")

    ad["_id"] = str(ad["_id"])
    return ad


@ads_router.post("/{ad_id}/recommend", responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}})
async def recommend_ad(ad_id: str, token: str = Depends(oauth2_scheme)):
    try:
        user_id = decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    try:
        obj_id = ObjectId(ad_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ad ID")

    ad = await ads_collection.find_one({"_id": obj_id})
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")

    if user_id in ad.get("reactions", {}).get("likes", {}).get("userIds", []):
        raise HTTPException(status_code=400, detail="You have already recommended this ad")

    try:
        await ads_collection.update_one(
            {"_id": obj_id},
            {
                "$inc": {"reactions.likes.count": 1},
                "$push": {"reactions.likes.userIds": user_id}
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update reactions: {str(e)}")

    return {"message": "Ad recommended successfully"}
