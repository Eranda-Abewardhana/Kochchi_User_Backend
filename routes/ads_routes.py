import os
import random
import shutil
import json
import cloudinary.uploader
import requests
from dotenv import load_dotenv
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends, Query, Body
from typing import List, Optional, Annotated
from bson import ObjectId
from datetime import datetime

from pydantic import ValidationError

from databases.mongo import db
from data_models.ads_model import (
    AdCreateResponse,
    AdDeleteResponse,
    AdApprovalResponse,
    ErrorResponse, TopAdPreview, AdListingPreview, AdOut, PaginatedAdResponse, AdBase, AdCreateSchema
)
from fastapi import Query, Depends, HTTPException
from typing import List
import random
from fastapi import APIRouter, Request, HTTPException
import stripe
import os
from datetime import datetime
from bson import ObjectId
from services.distance_radius_calculator import calculate_distance
from services.file_upload_service import save_uploaded_images, upload_image_to_cloudinary
from fastapi.security import OAuth2PasswordBearer
from utils.auth.jwt_functions import decode_token, get_admin_or_super, get_current_user
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
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
@ads_router.post(
    "/create",
    response_model=AdCreateResponse,
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    status_code=status.HTTP_201_CREATED
)
@ads_router.post(
    "/create",
    response_model=AdCreateResponse,
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    status_code=status.HTTP_201_CREATED
)
async def create_ad(
    data: AdCreateSchema = Depends(),  # Accept body as form-data or JSON
    images: List[UploadFile] = File(...),
    coupon_code: Optional[str] = Form(default=None),
    current_user: dict = Depends(get_current_user)
):
    email = current_user['email']
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")

    ad_id = None
    image_urls = []

    try:
        ad_data = data.dict()
        now = datetime.utcnow()
        expiry = now + timedelta(days=31)

        price_ids = ad_data.get("adSettings", {}).get("price_ids", [])
        if not price_ids:
            raise HTTPException(status_code=400, detail="No Stripe price IDs provided")

        ad_data.update({
            "approval": {"status": "pending", "adminId": None, "adminComment": None, "approvedAt": None},
            "reactions": {"likes": {"count": 0, "userIds": []}, "unlikes": {"count": 0, "userIds": []}},
            "recommendations": {"count": 0, "userIds": []},
            "visibility": "hidden",
            "createdAt": now,
            "updatedAt": now,
            "expiryDate": expiry
        })

        # 1️⃣ Insert ad
        result = await ads_collection.insert_one(ad_data)
        ad_id = str(result.inserted_id)

        # 2️⃣ Upload images
        if images:
            image_urls = save_uploaded_images(images, cloud_folder=f"ads/{ad_id}")
            await ads_collection.update_one({"_id": result.inserted_id}, {"$set": {"images": image_urls}})

        # 3️⃣ Prepare and trigger payment
        backend_url = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")

        payment_payload = {
            "ad_id": ad_id,
            "price_ids": price_ids,
            "currency": "usd",
            "description": ad_data.get("business", {}).get("description", "Ad Payment"),
            "customer_email": email,
            "customer_name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip(),
            "coupon_code": coupon_code
        }

        try:
            payment_response = requests.post(f"{backend_url}/api/payments/initiate", json=payment_payload)
            payment_response.raise_for_status()
            payment_info = payment_response.json()
        except Exception as e:
            await ads_collection.delete_one({"_id": result.inserted_id})
            for url in image_urls:
                try:
                    parts = url.split("/")
                    public_id = "/".join(parts[parts.index("ads"):-1]) + "/" + parts[-1].split(".")[0]
                    cloudinary.uploader.destroy(public_id)
                except Exception as ce:
                    print(f"Failed to delete Cloudinary image: {ce}")
            raise HTTPException(status_code=500, detail=f"Payment initiation failed: {str(e)}")

        return {
            "message": "Ad created successfully, waiting for payment",
            "adId": ad_id,
            "images": image_urls,
            "payment": payment_info
        }

    except Exception as e:
        if ad_id:
            await ads_collection.delete_one({"_id": ObjectId(ad_id)})
        for url in image_urls:
            try:
                parts = url.split("/")
                public_id = "/".join(parts[parts.index("ads"):-1]) + "/" + parts[-1].split(".")[0]
                cloudinary.uploader.destroy(public_id)
            except Exception as ce:
                print(f"Cleanup failed for Cloudinary image: {ce}")
        raise HTTPException(status_code=500, detail=f"Creation failed: {str(e)}")


@ads_router.delete(
    "/{ad_id}",
    response_model=AdDeleteResponse,
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    status_code=status.HTTP_200_OK
)
async def delete_ad(ad_id: str,  current_user: dict = Depends(get_current_user)):
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
    responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
status_code=status.HTTP_201_CREATED
)
async def approve_ad_by_admin(
    ad_id: str,
    status: str = Form(...),
    comment: Optional[str] = Form(None),
    current_user: dict = Depends(get_admin_or_super)
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



@ads_router.get("/approve",status_code=status.HTTP_201_CREATED)
async def get_approved_ads( current_user: dict = Depends(get_current_user)):
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


@ads_router.get("/my", responses={401: {"model": ErrorResponse}}, status_code=status.HTTP_201_CREATED)
async def get_my_ads( current_user: dict = Depends(get_current_user)):
    try:
        email = current_user['email']
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


@ads_router.get("/{ad_id}", responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},status_code=status.HTTP_200_OK)
async def get_ad_details(ad_id: str,  current_user: dict = Depends(get_current_user)):
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
    },
status_code=status.HTTP_200_OK
)
async def like_ad(ad_id: str,  current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user['user_id']
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
    },
    status_code=status.HTTP_200_OK
)
async def unlike_ad(ad_id: str,  current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user['user_id']
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
    },
    status_code=status.HTTP_200_OK
)
async def recommend_ad(ad_id: str, current_user: dict = Depends(get_current_user)):
    # Step 1: Decode user
    try:
        user_id = current_user['user_id']
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

@ads_router.get("/top-full-ads", response_model=PaginatedAdResponse)
async def get_full_top_ads(
    current_user: dict = Depends(get_current_user),
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
async def get_carousal_ads(current_user: dict = Depends(get_current_user)):
    cursor = ads_collection.find({
        "adSettings.isCarousalAd": True,
        "visibility": "visible"
    })

    ads = await cursor.to_list(length=None)

    if not ads:
        raise HTTPException(status_code=404, detail="No carousal ads found")

    random.shuffle(ads)
    selected = ads[:8]

    result = []
    for ad in selected:
        ad["ad_id"] = str(ad["_id"])

        try:
            result.append(AdOut(**ad))
        except ValidationError as e:
            print(f"Validation error for ad {ad.get('_id')}: {e}")
            continue  # Skip invalid ads

    return result
@ads_router.get("/sorted-all", response_model=List[AdListingPreview])
async def get_all_ads_sorted_by_priority(current_user: dict = Depends(get_current_user)):
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
    current_user: dict = Depends(get_current_user)):
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
@ads_router.post("/webhook")
async def stripe_webhook(request: Request, current_user: dict = Depends(get_current_user)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")

    # ✅ Payment completed
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        ad_id = session.get("metadata", {}).get("ad_id")

        if ad_id:
            print(f"✅ Payment success for ad {ad_id}")
            await ads_collection.update_one(
                {"_id": ObjectId(ad_id)},
                {"$set": {"visibility": "visible", "updatedAt": datetime.utcnow()}}
            )

    elif event["type"] == "checkout.session.expired":
        print("⚠️ Session expired:", event["data"]["object"]["id"])

    elif event["type"] == "payment_intent.payment_failed":
        print("❌ Payment failed:", event["data"]["object"]["id"])

    else:
        print("📦 Unhandled event:", event["type"])

    return {"status": "success"}