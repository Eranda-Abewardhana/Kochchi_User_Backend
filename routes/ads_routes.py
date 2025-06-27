import os
import random
import shutil
import json
import requests
from dotenv import load_dotenv
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends, Query, Body
from typing import List, Optional, Annotated
from bson import ObjectId
from datetime import datetime
from databases.mongo import db
from data_models.ads_model import (
    AdCreateResponse,
    AdDeleteResponse,
    AdApprovalResponse,
    ErrorResponse, TopAdPreview, AdListingPreview, AdOut, PaginatedAdResponse, AdBase, AdCreateSchema
)
from services.distance_radius_calculator import calculate_distance
from services.file_upload_service import save_uploaded_images, upload_image_to_cloudinary
from fastapi.security import OAuth2PasswordBearer
from utils.auth.jwt_functions import decode_token, get_admin_or_super
from datetime import timedelta

ads_router = APIRouter(prefix="/ads", tags=["Ads"])

ads_collection = db["ads"]
payments_collection = db["payments"]
approvals_collection = db["admin_approvals"]
ad_pricing_collection = db["ad_pricing"]
users_collection = db["users"]

BASE_IMAGE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data_sources", "other_ads"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
# Load environment variables
load_dotenv()

@ads_router.post(
    "/create",
    response_model=AdCreateResponse,
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
@ads_router.post(
    "/create",
    response_model=AdCreateResponse,
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def create_ad(
    ad_json: str = Form(...),
    images: List[UploadFile] = File(...),
    token: str = Depends(oauth2_scheme),
    docs_model: Optional[AdCreateSchema] = Body(default=None)
):
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")

    ad_id = None
    image_folder = None

    try:
        # Parse input JSON
        ad_data = json.loads(ad_json)
        now = datetime.utcnow()
        expiry = now + timedelta(days=31)

        ad_data.update({
            "approval": {"status": "pending", "adminId": None, "adminComment": None, "approvedAt": None},
            "reactions": {"likes": {"count": 0, "userIds": []}, "unlikes": {"count": 0, "userIds": []}},
            "recommendations": {"count": 0, "userIds": []},
            "visibility": "hidden",
            "createdAt": now, "updatedAt": now, "expiryDate": expiry
        })

        # 1️⃣ Insert ad document
        result = await ads_collection.insert_one(ad_data)
        ad_id = str(result.inserted_id)

        if images:
            # 2️⃣ Upload images to Cloudinary
            image_urls = save_uploaded_images(images, cloud_folder=f"ads/{ad_id}")
            await ads_collection.update_one({"_id": result.inserted_id}, {"$set": {"images": image_urls}})

        # 3️⃣ Pricing logic
        pricing_doc = await ad_pricing_collection.find_one({})
        if not pricing_doc:
            raise HTTPException(status_code=404, detail="Pricing data not found")

        ad_settings = ad_data.get("adSettings", {})
        is_top = ad_settings.get("isTopAd", False)
        is_carousal = ad_settings.get("isCarousalAd", False)
        ad_types = []
        if is_top:
            ad_types.append("top_add_price")
        if is_carousal:
            ad_types.append("carosal_add_price")
        if not ad_types:
            ad_types.append("base_price")

        now_date = now.date()
        effective_price_total = 0

        for ad_type in ad_types:
            type_data = pricing_doc.get(ad_type)
            if not type_data:
                raise HTTPException(status_code=404, detail=f"No pricing info for ad type '{ad_type}'")

            price = type_data.get("price", 0)
            discount = type_data.get("discount_applied")

            if discount:
                start = datetime.strptime(discount["start_date"], "%Y-%m-%d").date()
                end = datetime.strptime(discount["end_date"], "%Y-%m-%d").date()
                if start <= now_date <= end:
                    percent = discount.get("value_percent", 0)
                    price = round(price * (1 - percent / 100), 2)

            effective_price_total += price

        # 4️⃣ Call payment service (like you're doing)
        backend_url = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")

        payment_payload = {
            "ad_id": ad_id,
            "ad_type":  ", ".join(ad_types),
            "amount": effective_price_total,  # send the calculated amount to payment service
            "currency": "usd",  # always better to pass currency
            "description": ad_data.get("business", {}).get("description", "Ad Payment"),
            "customer_email": email,
            "customer_name": f"{user.get('first_name', '')} {user.get('last_name', '')}"
        }

        try:
            payment_response = requests.post(f"{backend_url}/api/payments/initiate", json=payment_payload)
            payment_response.raise_for_status()
            payment_info = payment_response.json()
        except Exception as e:
            # 🛑 Rollback if payment service call failed
            if ad_id:
                await ads_collection.delete_one({"_id": ad_id})
            if image_folder and os.path.exists(image_folder):
                import shutil
                shutil.rmtree(image_folder)
            raise HTTPException(status_code=500, detail=f"Payment initiation failed: {str(e)}")

        # 5️⃣ Return response
        return {
            "message": "Ad created successfully, waiting for payment",
            "adId": ad_id,
            "images": image_urls,
            "payment": payment_info
        }

    except Exception as e:
        # Global fallback rollback
        if ad_id:
            await ads_collection.delete_one({"_id": ad_id})
        if image_folder and os.path.exists(image_folder):
            import shutil
            shutil.rmtree(image_folder)
        raise HTTPException(status_code=500, detail=f"Creation failed: {str(e)}")

@ads_router.delete(
    "/{ad_id}",
    response_model=AdDeleteResponse,
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}}
)
async def delete_ad(ad_id: str, token: str = Depends(oauth2_scheme)):
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
async def approve_ad_by_admin(
    ad_id: str,
    status: str = Form(...),
    comment: Optional[str] = Form(None),
    current_user: dict = Depends(get_admin_or_super),
    token: str = Depends(oauth2_scheme)
):
    # Validate status input
    if status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be either 'approved' or 'rejected'")

    # Validate ObjectId
    try:
        obj_id = ObjectId(ad_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ad ID format")

    # Extract admin identity securely
    admin_id = current_user.get("username") or current_user.get("email")

    # Build update payload
    update_data = {
        "approval.status": status,
        "approval.adminId": admin_id,
        "approval.adminComment": comment,
        "approval.approvedAt": datetime.utcnow(),
        "visibility": "visible" if status == "approved" else "hidden",
        "updatedAt": datetime.utcnow()
    }

    # Perform the update
    result = await ads_collection.update_one({"_id": obj_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="No ad found to approve/reject")

    # Log approval in separate collection
    try:
        await approvals_collection.insert_one({
            "admin_id": admin_id,
            "ad_id": ad_id,
            "approved_at": datetime.utcnow(),
            "status": status,
            "comment": comment
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Approval logging failed: {str(e)}")

    return {
        "message": f"Ad {status} successfully",
        "adId": ad_id,
        "status": status,
        "approvedBy": admin_id
    }



@ads_router.get("/approve")
async def get_approved_ads(token: str = Depends(oauth2_scheme)):
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
async def get_ad_details(ad_id: str, token: str = Depends(oauth2_scheme)):
    try:
        obj_id = ObjectId(ad_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ad ID")

    ad = await ads_collection.find_one({"_id": obj_id})
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")

    ad["_id"] = str(ad["_id"])
    return ad


@ads_router.post(
    "/{ad_id}/like",
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def like_ad(ad_id: str, token: str = Depends(oauth2_scheme)):
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

    try:
        update_ops = {}
        message = ""

        if user_id in ad.get("reactions", {}).get("likes", {}).get("userIds", []):
            update_ops = {
                "$inc": {"reactions.likes.count": -1},
                "$pull": {"reactions.likes.userIds": user_id}
            }
            message = "Like removed"
        else:
            update_ops = {
                "$inc": {"reactions.likes.count": 1},
                "$push": {"reactions.likes.userIds": user_id}
            }
            message = "Ad liked successfully"

            # If user had previously unliked, remove it
            if user_id in ad.get("reactions", {}).get("unlikes", {}).get("userIds", []):
                update_ops["$inc"]["reactions.unlikes.count"] = -1
                update_ops["$pull"] = {"reactions.unlikes.userIds": user_id}

        await ads_collection.update_one({"_id": obj_id}, update_ops)
        return {"message": message}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update likes: {str(e)}")
@ads_router.post(
    "/{ad_id}/unlike",
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def unlike_ad(ad_id: str, token: str = Depends(oauth2_scheme)):
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

    try:
        update_ops = {}
        message = ""

        if user_id in ad.get("reactions", {}).get("unlikes", {}).get("userIds", []):
            update_ops = {
                "$inc": {"reactions.unlikes.count": -1},
                "$pull": {"reactions.unlikes.userIds": user_id}
            }
            message = "Unlike removed"
        else:
            update_ops = {
                "$inc": {"reactions.unlikes.count": 1},
                "$push": {"reactions.unlikes.userIds": user_id}
            }
            message = "Ad unliked successfully"

            # If user had previously liked, remove it
            if user_id in ad.get("reactions", {}).get("likes", {}).get("userIds", []):
                update_ops["$inc"]["reactions.likes.count"] = -1
                update_ops["$pull"] = {"reactions.likes.userIds": user_id}

        await ads_collection.update_one({"_id": obj_id}, update_ops)
        return {"message": message}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update unlikes: {str(e)}")

@ads_router.post(
    "/{ad_id}/recommend",
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def recommend_ad(ad_id: str, token: str = Depends(oauth2_scheme)):
    # Step 1: Decode user
    try:
        user_id = decode_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Step 2: Validate Object ID
    try:
        obj_id = ObjectId(ad_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ad ID")

    # Step 3: Fetch Ad
    ad = await ads_collection.find_one({"_id": obj_id})
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")

    # Step 4: Check if already recommended
    if user_id in ad.get("recommendations", {}).get("userIds", []):
        raise HTTPException(status_code=400, detail="You have already recommended this ad")

    # Step 5: Update recommendations
    try:
        await ads_collection.update_one(
            {"_id": obj_id},
            {
                "$inc": {"recommendations.count": 1},
                "$push": {"recommendations.userIds": user_id}
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update recommendations: {str(e)}")

    return {"message": "Ad recommended successfully"}

from fastapi import Query, Depends, HTTPException
from typing import List
import random

@ads_router.get("/top-full-ads", response_model=PaginatedAdResponse)
async def get_full_top_ads(
    token: str = Depends(oauth2_scheme),
    page: int = Query(1, ge=1)
):
    PAGE_SIZE = 24

    # 🔍 Fetch top ads only (visible)
    ads_cursor = ads_collection.find({"adSettings.isTopAd": True, "visibility": "visible"})
    all_ads = await ads_cursor.to_list(length=None)

    if not all_ads:
        raise HTTPException(status_code=404, detail="No top ads found")

    # 🔀 Shuffle for random ordering every time
    random.shuffle(all_ads)

    total_ads = len(all_ads)
    total_pages = (total_ads + PAGE_SIZE - 1) // PAGE_SIZE

    if page > total_pages:
        raise HTTPException(status_code=400, detail=f"Page {page} exceeds total pages {total_pages}")

    # ⏬ Paginate
    start = (page - 1) * PAGE_SIZE
    end = start + PAGE_SIZE
    page_ads = all_ads[start:end]

    # 🔁 Format each ad
    results = []
    for ad in page_ads:
        ad["ad_id"] = str(ad["_id"])  # Alias for model compatibility
        results.append(AdOut(**ad))

    return {
        "page": page,
        "total_pages": total_pages,
        "total_ads": total_ads,
        "results": results
    }
@ads_router.get("/carousal-ads", response_model=List[AdOut])
async def get_carousal_ads(token: str = Depends(oauth2_scheme)):
    # 🔍 Query for carousal + visible ads
    cursor = ads_collection.find({
        "adSettings.isCarousalAd": True,
        "visibility": "visible"
    })

    ads = await cursor.to_list(length=None)

    if not ads:
        raise HTTPException(status_code=404, detail="No carousal ads found")

    # 🔀 Shuffle and take first 8
    random.shuffle(ads)
    selected = ads[:8]

    # 🔁 Convert to Pydantic model with ad_id
    result = []
    for ad in selected:
        ad["ad_id"] = str(ad["_id"])  # Inject adId field
        result.append(AdOut(**ad))

    return result
@ads_router.get("/sorted-all", response_model=List[AdListingPreview])
async def get_all_ads_sorted_by_priority(token: str = Depends(oauth2_scheme)):
    all_ads = []

    async for ad in ads_collection.find({"visibility": "visible"}):
        score = 0

        # Prioritize night-time / PM businesses
        open_time = ad.get("business", {}).get("openTime", "").lower()
        if "pm" in open_time or "night" in open_time:
            score += 1

        ad_data = AdListingPreview(
            ad_id=str(ad["_id"]),
            title=ad.get("business", {}).get("title", "Untitled Ad"),
            image_url=ad.get("images", [None])[0],
            city=ad.get("location", {}).get("city"),
            district=ad.get("location", {}).get("district"),
            category=ad.get("category"),
            contact_name=ad.get("contact", {}).get("name"),
            contact_phone=ad.get("contact", {}).get("phone"),
            priority_score=score
        )

        all_ads.append(ad_data)

    if not all_ads:
        raise HTTPException(status_code=404, detail="No ads found")

    # Sort by score descending
    all_ads.sort(key=lambda x: x.priority_score, reverse=True)

    return all_ads
@ads_router.get("/restaurants-nearby", response_model=List[AdListingPreview])
async def find_nearby_restaurants(
    lat: float = Query(..., description="Your latitude"),
    lng: float = Query(..., description="Your longitude"),
    max_distance_km: float = Query(10.0, description="Search radius in kilometers"),
    token: str = Depends(oauth2_scheme)
):
    nearby_ads = []

    async for ad in ads_collection.find({"category": "Restaurants", "visibility": "visible"}):
        location = ad.get("location", {})
        ad_lat = location.get("lat")
        ad_lng = location.get("lng")

        if ad_lat is None or ad_lng is None:
            continue

        distance = calculate_distance(lat, lng, ad_lat, ad_lng)

        if distance <= max_distance_km:
            nearby_ads.append(
                AdListingPreview(
                    ad_id=str(ad["_id"]),
                    title=ad.get("business", {}).get("title", "Untitled Ad"),
                    image_url=ad.get("images", [None])[0],
                    city=location.get("city"),
                    district=location.get("district"),
                    category=ad.get("category"),
                    contact_name=ad.get("contact", {}).get("name"),
                    contact_phone=ad.get("contact", {}).get("phone"),
                    priority_score=0  # or set based on logic
                )
            )

    return nearby_ads
