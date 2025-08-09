import os
import random
import shutil
import json
import cloudinary.uploader
import requests
from dotenv import load_dotenv
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends, Query, Body
from typing import List, Optional, Annotated, Dict, Any
from bson import ObjectId
from datetime import datetime
import re
from pydantic import ValidationError, HttpUrl

from databases.mongo import db
from data_models.ads_model import (
    AdCreateResponse,
    AdDeleteResponse,
    AdApprovalResponse,
    ErrorResponse, TopAdPreview, AdListingPreview, AdOut, PaginatedAdResponse, AdBase, AdCreateSchema,
    ApprovedAdPreview, ApprovedAdListResponse, AdListResponse, SimplifiedAdPreview, AdUpdateResponse, AdUpdateSchema
)
from fastapi import Query, Depends, HTTPException
from typing import List
import random
from fastapi import APIRouter, Request, HTTPException
import stripe
import os
from datetime import datetime
from bson import ObjectId

from routes.payment__routes import initiate_payment, create_stripe_checkout_session
from routes.pricing_routes import get_all_prices
from services.distance_radius_calculator import calculate_distance
from services.file_upload_service import save_uploaded_images, upload_image_to_cloudinary
from fastapi.security import OAuth2PasswordBearer
from utils.auth.jwt_functions import decode_token, get_admin_or_super, get_current_user
from datetime import timedelta
from utils.examples.ads import example_json, ads_description
from bson import ObjectId
# Convert all HttpUrl, datetime, etc. to JSON-serializable values
def convert_to_serializable(obj):
    if isinstance(obj, (datetime,)):
        return obj
    if isinstance(obj, HttpUrl):
        return str(obj)
    if isinstance(obj, dict):
        return {k: convert_to_serializable(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [convert_to_serializable(i) for i in obj]
    return obj

def extract_lat_lon_from_string(location_str: Optional[str]):
    """
    Extracts lat, lon from a coordinate string like '6.9271,79.8612' or a full map URL.
    """
    if not location_str:
        return None, None
    match = re.search(r'([-+]?[0-9]*\.?[0-9]+)[,\s]+([-+]?[0-9]*\.?[0-9]+)', location_str)
    if match:
        return float(match.group(1)), float(match.group(2))
    return None, None

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


from pymongo.errors import ServerSelectionTimeoutError
from fastapi.responses import JSONResponse

@ads_router.get("/filter")
async def filter_ads(
        category: Optional[str] = Query(None, description="Filter by main category"),
        specialty: Optional[str] = Query(None, description="Optional filter by specialty"),
        city: Optional[str] = Query(None, description="Optional filter by city"),
        lat: Optional[float] = Query(None, description="Latitude for distance-based sorting"),
        lng: Optional[float] = Query(None, description="Longitude for distance-based sorting")
):
    query = {
        "visibility": "visible",
        "approval.status": "approved"
    }

    if category and category.lower() != "all categories":
        query["business.category"] = {"$regex": category, "$options": "i"}
    if specialty:
        query["business.specialty"] = specialty
    if city:
        query["location.city"] = city

    try:
        ads_cursor = ads_collection.find(query)
        ads = await ads_cursor.to_list(length=None)
    except ServerSelectionTimeoutError as e:
        return JSONResponse(
            status_code=503,
            content={"error": "Database connection failed. Please try again later.", "details": str(e)}
        )

    results = []
    for ad in ads:
        contact = ad.get("contact", {})
        location = ad.get("location", {})
        business = ad.get("business", {})
        schedule = ad.get("schedule", {})
        adSettings = ad.get("adSettings", {})
        approval = ad.get("approval", {})
        reactions = ad.get("reactions", {})
        recommendations = ad.get("recommendations", {})

        ad_lat = location.get("lat")
        ad_lng = location.get("lon")
        if (ad_lat is None or ad_lng is None) and location.get("googleMapLocation"):
            ad_lat, ad_lng = extract_lat_lon_from_string(location["googleMapLocation"])

        if lat is not None and lng is not None:
            if ad_lat is None or ad_lng is None:
                continue
            distance = calculate_distance(lat, lng, ad_lat, ad_lng)
        else:
            distance = 0

        # Return raw dictionary instead of Pydantic model to bypass all validations
        results.append({
            "ad_id": str(ad["_id"]),
            "title": ad.get("shopName", "Untitled Ad"),
            "image_url": ad.get("images", [None])[0] if ad.get("images") else None,
            "priority_score": int(100 - distance),
            "shopName": ad.get("shopName", ""),

            # Contact
            "contact_address": contact.get("address", ""),
            "contact_phone": contact.get("phone", ""),
            "contact_whatsapp": contact.get("whatsapp"),
            "contact_email": contact.get("email"),
            "contact_website": contact.get("website"),

            # Location
            "location_googleMapLocation": location.get("googleMapLocation"),
            "location_city": location.get("city", ""),
            "location_district": location.get("district", ""),
            "location_province": location.get("province"),
            "location_country": location.get("country", "Sri Lanka"),
            "location_state": location.get("state"),

            # Business
            "business_category": business.get("category", ""),
            "business_specialty": business.get("specialty"),
            "business_tags": business.get("tags", []),
            "business_halalAvailable": business.get("halalAvailable", False),
            "business_description": business.get("description"),
            "business_menuOptions": business.get("menuOptions", []),

            # Schedule
            "schedule_mon": schedule.get("mon", []),
            "schedule_tue": schedule.get("tue", []),
            "schedule_wed": schedule.get("wed", []),
            "schedule_thu": schedule.get("thu", []),
            "schedule_fri": schedule.get("fri", []),
            "schedule_sat": schedule.get("sat", []),
            "schedule_sun": schedule.get("sun", []),

            # AdSettings
            "isTopAd": adSettings.get("isTopAd", False),
            "isCarousalAd": adSettings.get("isCarousalAd", False),
            "hasHalal": adSettings.get("hasHalal", False),

            # Media
            "images": ad.get("images", []),
            "videoUrl": ad.get("videoUrl"),

            # Approval
            "approval_status": approval.get("status", ""),
            "approval_adminId": approval.get("adminId"),
            "approval_adminComment": approval.get("adminComment"),
            "approval_approvedAt": approval.get("approvedAt"),

            # Reactions
            "likes_count": reactions.get("likes", {}).get("count", 0),
            "likes_userIds": reactions.get("likes", {}).get("userIds", []),
            "unlikes_count": reactions.get("unlikes", {}).get("count", 0),
            "unlikes_userIds": reactions.get("unlikes", {}).get("userIds", []),

            # Recommendations
            "recommendations_count": recommendations.get("count", 0),
            "recommendations_userIds": recommendations.get("userIds", []),

            "visibility": ad.get("visibility", ""),
            "expiryDate": ad.get("expiryDate"),
            "createdAt": ad.get("createdAt"),
            "updatedAt": ad.get("updatedAt")
        })

    if lat is not None and lng is not None:
        results.sort(key=lambda x: -x['priority_score'])

    return results



@ads_router.post(
    "/create",
    response_model=AdCreateResponse,
    summary="Create a new ad with images and JSON data",
    description=ads_description,
    responses={
    400: {"model": ErrorResponse},
    422: {"model": ErrorResponse},
    500: {"model": ErrorResponse}
    },
    status_code=status.HTTP_201_CREATED
    )
async def create_ad(
    data: Annotated[str, Form(...)],  # Receive JSON as string from multipart form
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
        parsed_data = json.loads(data)
        ad_data_obj = AdCreateSchema(**parsed_data)  # Validate schema
        ad_data = ad_data_obj.dict()

        now = datetime.utcnow()
        expiry = now + timedelta(days=31)

        ad_data.update({
            "userId": current_user["user_id"],
            "approval": {"status": "pending", "adminId": None, "adminComment": None, "approvedAt": None},
            "reactions": {"likes": {"count": 0, "userIds": []}, "unlikes": {"count": 0, "userIds": []}},
            "recommendations": {"count": 0, "userIds": []},
            "visibility": "hidden",
            "createdAt": now,
            "updatedAt": now,
            "expiryDate": expiry
        })
        business = ad_data.get("business", {})
        business_category = business.get("category", "")
        # Fetch all Stripe prices using your method
        pricing_doc = await get_all_prices()
        all_prices = pricing_doc.get("prices", [])

        # Get ad settings
        is_top = ad_data.get("adSettings", {}).get("isTopAd", False)
        is_carousal = ad_data.get("adSettings", {}).get("isCarousalAd", False)

        matched_price_ids = []
        total_amount = 0

        for item in all_prices:
            product_name = item.get("product", {}).get("name", "").lower()

            if is_top and "top_add_price" in product_name:
                matched_price_ids.append(item["price_id"])
                total_amount += item.get("amount", 0)

            elif is_carousal and "carosal_add_price" in product_name:
                matched_price_ids.append(item["price_id"])
                total_amount += item.get("amount", 0)

            elif "base_price" in product_name and  business_category != 'Sri Lankan Worldwide Restaurant' :
                    matched_price_ids.append(item["price_id"])
                    total_amount += item.get("amount", 0)
            elif "international_add_price" in product_name and business_category == 'Sri Lankan Worldwide Restaurant':
                    matched_price_ids.append(item["price_id"])
                    total_amount += item.get("amount", 0)


        # Remove duplicates if both are true
        matched_price_ids = list(set(matched_price_ids))

        if not matched_price_ids:
            raise HTTPException(status_code=400, detail="No matching Stripe prices found for ad settings.")

        # 1️⃣ Insert ad
        ad_data = convert_to_serializable(ad_data)
        result = await ads_collection.insert_one(ad_data)
        ad_id = str(result.inserted_id)

        # 2️⃣ Upload images
        if images:
            image_urls = save_uploaded_images(images, cloud_folder=f"ads/{ad_id}")
            await ads_collection.update_one({"_id": result.inserted_id}, {"$set": {"images": image_urls}})

        # 3️⃣ Prepare and trigger payment
        print('go for payments')
        payment_payload = {
            "ad_id": ad_id,
            "price_ids": matched_price_ids,
            "currency": "usd",
            "amount": total_amount,
            "description": ad_data.get("business", {}).get("description", "Ad Payment"),
            "customer_email": email,
            "customer_name": f"{user.get('first_name', '')} {user.get('last_name', '')}".strip(),
            "coupon_code": coupon_code
        }

        try:
            if total_amount <= 0:
                raise ValueError("Invalid total amount for payment.")

            print("Stripe payment payload:", payment_payload)
            payment_info = create_stripe_checkout_session(payment_payload)
            # Save session ID in DB for tracking later
            await ads_collection.update_one({"_id": result.inserted_id}, {
                "$set": {"stripeSessionId": payment_info["session_id"]}
            })

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

from bson import ObjectId

@ads_router.get("/carousal-ads")
async def get_carousal_ads():
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
        try:
            ad["_id"] = str(ad["_id"])  # Convert ObjectId to string
            result.append(ad)
        except Exception as e:
            print(f"Error processing ad {ad.get('_id')}: {e}")
            continue

    return result

@ads_router.get("/pending")
async def get_pending_ads():
    cursor = ads_collection.find({
        "approval.status": "pending"
    })

    ads = await cursor.to_list(length=None)

    if not ads:
        raise HTTPException(status_code=404, detail="No carousal ads found")

    result = []

    for ad in ads:
        try:
            ad["_id"] = str(ad["_id"])  # Convert ObjectId to string
            result.append(ad)
        except Exception as e:
            print(f"Error processing ad {ad.get('_id')}: {e}")
            continue

    return result
@ads_router.get(
    "/approve",
    summary="Get all approved ads",
    description="Returns a list of approved ads including shop ID, name, city, and image.",
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    status_code=status.HTTP_200_OK
)
async def get_approved_ads():
    try:
        ads = await ads_collection.find({"approval.status": "approved"}).to_list(length=None)
        results = []
        for ad in ads:
            contact = ad.get("contact", {})
            location = ad.get("location", {})
            business = ad.get("business", {})
            schedule = ad.get("schedule", {})
            adSettings = ad.get("adSettings", {})
            approval = ad.get("approval", {})
            reactions = ad.get("reactions", {})
            recommendations = ad.get("recommendations", {})

            ad_lat = location.get("lat")
            ad_lng = location.get("lon")

                        # Return raw dictionary instead of Pydantic model to bypass all validations
            results.append({
                "ad_id": str(ad["_id"]),
                "title": ad.get("shopName", "Untitled Ad"),
                "image_url": ad.get("images", [None])[0] if ad.get("images") else None,
                "priority_score": 0,
                "shopName": ad.get("shopName", ""),

                # Contact
                "contact_address": contact.get("address", ""),
                "contact_phone": contact.get("phone", ""),
                "contact_whatsapp": contact.get("whatsapp"),
                "contact_email": contact.get("email"),
                "contact_website": contact.get("website"),

                # Location
                "location_googleMapLocation": location.get("googleMapLocation"),
                "location_city": location.get("city", ""),
                "location_district": location.get("district", ""),
                "location_province": location.get("province"),
                "location_country": location.get("country", "Sri Lanka"),
                "location_state": location.get("state"),

                # Business
                "business_category": business.get("category", ""),
                "business_specialty": business.get("specialty"),
                "business_tags": business.get("tags", []),
                "business_halalAvailable": business.get("halalAvailable", False),
                "business_description": business.get("description"),
                "business_menuOptions": business.get("menuOptions", []),

                # Schedule
                "schedule_mon": schedule.get("mon", []),
                "schedule_tue": schedule.get("tue", []),
                "schedule_wed": schedule.get("wed", []),
                "schedule_thu": schedule.get("thu", []),
                "schedule_fri": schedule.get("fri", []),
                "schedule_sat": schedule.get("sat", []),
                "schedule_sun": schedule.get("sun", []),

                # AdSettings
                "isTopAd": adSettings.get("isTopAd", False),
                "isCarousalAd": adSettings.get("isCarousalAd", False),
                "hasHalal": adSettings.get("hasHalal", False),

                # Media
                "images": ad.get("images", []),
                "videoUrl": ad.get("videoUrl"),

                # Approval
                "approval_status": approval.get("status", ""),
                "approval_adminId": approval.get("adminId"),
                "approval_adminComment": approval.get("adminComment"),
                "approval_approvedAt": approval.get("approvedAt"),

                # Reactions
                "likes_count": reactions.get("likes", {}).get("count", 0),
                "likes_userIds": reactions.get("likes", {}).get("userIds", []),
                "unlikes_count": reactions.get("unlikes", {}).get("count", 0),
                "unlikes_userIds": reactions.get("unlikes", {}).get("userIds", []),

                # Recommendations
                "recommendations_count": recommendations.get("count", 0),
                "recommendations_userIds": recommendations.get("userIds", []),

                "visibility": ad.get("visibility", ""),
                "expiryDate": ad.get("expiryDate"),
                "createdAt": ad.get("createdAt"),
                "updatedAt": ad.get("updatedAt")
            })

        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve approved ads: {str(e)}")

@ads_router.get("/my", responses={401: {"model": ErrorResponse}}, status_code=status.HTTP_200_OK)
async def get_my_ads(current_user: dict = Depends(get_current_user)):
    try:
        userId = current_user["user_id"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    ads = await ads_collection.find({"userId": userId}).to_list(length=None)

    result = []
    for ad in ads:
        if ad.get("images"):  # ✅ only include if images exist
            ad["id"] = str(ad["_id"])
            del ad["_id"]
            result.append(ad)

    return result

@ads_router.get(
    "/rejected",
    summary="Get all rejected ads",
    description="Returns a list of rejected ads including shop ID, name, city, and image.",
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    status_code=status.HTTP_200_OK
)
async def get_rejected_ads():
    try:
        ads = await ads_collection.find({"approval.status": "rejected"}).to_list(length=None)
        results = []
        for ad in ads:
            contact = ad.get("contact", {})
            location = ad.get("location", {})
            business = ad.get("business", {})
            schedule = ad.get("schedule", {})
            adSettings = ad.get("adSettings", {})
            approval = ad.get("approval", {})
            reactions = ad.get("reactions", {})
            recommendations = ad.get("recommendations", {})

            ad_lat = location.get("lat")
            ad_lng = location.get("lon")

            # Return raw dictionary instead of Pydantic model to bypass all validations
            results.append({
                "ad_id": str(ad["_id"]),
                "title": ad.get("shopName", "Untitled Ad"),
                "image_url": ad.get("images", [None])[0],
                "priority_score": 0,
                "shopName": ad.get("shopName", ""),

                # Contact
                "contact_address": contact.get("address", ""),
                "contact_phone": contact.get("phone", ""),
                "contact_whatsapp": contact.get("whatsapp"),
                "contact_email": contact.get("email"),
                "contact_website": contact.get("website"),

                # Location
                "location_googleMapLocation": location.get("googleMapLocation"),
                "location_city": location.get("city", ""),
                "location_district": location.get("district", ""),
                "location_province": location.get("province"),
                "location_country": location.get("country", "Sri Lanka"),
                "location_state": location.get("state"),

                # Business
                "business_category": business.get("category", ""),
                "business_specialty": business.get("specialty"),
                "business_tags": business.get("tags", []),
                "business_halalAvailable": business.get("halalAvailable", False),
                "business_description": business.get("description"),
                "business_menuOptions": business.get("menuOptions", []),

                # Schedule
                "schedule_mon": schedule.get("mon", []),
                "schedule_tue": schedule.get("tue", []),
                "schedule_wed": schedule.get("wed", []),
                "schedule_thu": schedule.get("thu", []),
                "schedule_fri": schedule.get("fri", []),
                "schedule_sat": schedule.get("sat", []),
                "schedule_sun": schedule.get("sun", []),

                # AdSettings
                "isTopAd": adSettings.get("isTopAd", False),
                "isCarousalAd": adSettings.get("isCarousalAd", False),
                "hasHalal": adSettings.get("hasHalal", False),

                # Media
                "images": ad.get("images", []),
                "videoUrl": ad.get("videoUrl"),

                # Approval
                "approval_status": approval.get("status", ""),
                "approval_adminId": approval.get("adminId"),
                "approval_adminComment": approval.get("adminComment"),
                "approval_approvedAt": approval.get("approvedAt"),

                # Reactions
                "likes_count": reactions.get("likes", {}).get("count", 0),
                "likes_userIds": reactions.get("likes", {}).get("userIds", []),
                "unlikes_count": reactions.get("unlikes", {}).get("count", 0),
                "unlikes_userIds": reactions.get("unlikes", {}).get("userIds", []),

                # Recommendations
                "recommendations_count": recommendations.get("count", 0),
                "recommendations_userIds": recommendations.get("userIds", []),

                "visibility": ad.get("visibility", ""),
                "expiryDate": ad.get("expiryDate"),
                "createdAt": ad.get("createdAt"),
                "updatedAt": ad.get("updatedAt")
            })

        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve rejected ads: {str(e)}")

@ads_router.get("/my", responses={401: {"model": ErrorResponse}}, status_code=status.HTTP_200_OK)
async def get_my_ads(current_user: dict = Depends(get_current_user)):
    try:
        userId = current_user["user_id"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    ads = await ads_collection.find({"userId": userId}).to_list(100)

    result = []
    for ad in ads:
        if ad.get("images"):  # ✅ only include if images exist
            ad["id"] = str(ad["_id"])
            del ad["_id"]
            result.append(ad)

    return result


def convert_object_ids(doc):
    if isinstance(doc, list):
        return [convert_object_ids(item) for item in doc]
    elif isinstance(doc, dict):
        new_doc = {}
        for k, v in doc.items():
            if isinstance(v, ObjectId):
                new_doc[k] = str(v)
            elif isinstance(v, (dict, list)):
                new_doc[k] = convert_object_ids(v)
            else:
                new_doc[k] = v
        return new_doc
    else:
        return doc



@ads_router.get("/top-full-ads")
async def get_full_top_ads(
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
        ad["ad_id"] = str(ad["_id"])
        results.append(convert_object_ids(ad))

    return {
        "page": page,
        "total_pages": total_pages,
        "total_ads": total_ads,
        "results": results
    }

@ads_router.get("/sorted-all", response_model=List[SimplifiedAdPreview])
async def get_all_ads_sorted_by_priority():
    all_ads = []

    async for ad in ads_collection.find({"visibility": "visible"}):
        score = 0

        # Prioritize night-time / PM businesses
        open_time = ad.get("business", {}).get("openTime", "").lower()
        if "pm" in open_time or "night" in open_time:
            score += 1

        ad_data = SimplifiedAdPreview(
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
@ads_router.get("/restaurants-nearby")
async def find_nearby_restaurants(
    lat: float = Query(..., description="Your latitude"),
    lng: float = Query(..., description="Your longitude"),
    max_distance_km: float = Query(10.0, description="Search radius in kilometers")
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
            # Return raw dictionary instead of Pydantic model to bypass all validations
            nearby_ads.append({
                "ad_id": str(ad["_id"]),
                "title": ad.get("business", {}).get("title", "Untitled Ad"),
                "image_url": ad.get("images", [None])[0],
                "city": location.get("city"),
                "district": location.get("district"),
                "category": ad.get("category"),
                "contact_name": ad.get("contact", {}).get("name"),
                "contact_phone": ad.get("contact", {}).get("phone"),
                "priority_score": 0  # or set based on logic
            })

    return nearby_ads
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

    # Perform update
    result = await ads_collection.update_one({"_id": obj_id}, {"$set": update_data})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ad not found")

    return AdApprovalResponse(
        ad_id=ad_id,
        status=status,
        comment=comment,
        approved_by=admin_id
    )

@ads_router.get("/{ad_id}", responses={400: {"model": ErrorResponse}, 404: {"model": ErrorResponse}},status_code=status.HTTP_200_OK)
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

@ads_router.patch(
    "/{ad_id}/update",
    response_model=AdUpdateResponse,
    summary="Update editable fields of an ad",
    description="Allows updating ad details such as business info, ad settings, or contact fields. Immutable fields like userId, approval, and creation dates are not modified.",
    responses={
        400: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    status_code=status.HTTP_200_OK
)
async def update_ad_details(
    ad_id: str,
    update_data: AdUpdateSchema = Body(...),
    current_user: dict = Depends(get_current_user)
):
    # Validate ad existence
    ad = await ads_collection.find_one({"_id": ObjectId(ad_id)})
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")

    # Check user authorization
    if ad.get("userId") != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this ad")

    # Only allow editable fields
    editable_fields = {"business", "contact", "adSettings", "schedule", "location", "title", "description"}

    # get only sent fields
    try:
        incoming_updates = update_data.dict(exclude_unset=True)  # Pydantic v1
    except AttributeError:
        incoming_updates = update_data.model_dump(exclude_unset=True)  # Pydantic v2

    updates = {}

    for key, value in incoming_updates.items():
        if key in editable_fields:
            if isinstance(value, dict) and isinstance(ad.get(key), dict):
                # Merge nested dict
                updates[key] = {**ad.get(key, {}), **value}
            else:
                updates[key] = value

    if not updates:
        raise HTTPException(status_code=400, detail="No valid fields provided for update")

    updates["updatedAt"] = datetime.utcnow()

    # Apply update
    result = await ads_collection.update_one(
        {"_id": ObjectId(ad_id)},
        {"$set": updates}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Update failed")

    return {
        "message": "Ad updated successfully",
        "adId": ad_id,
        "updatedFields": updates
    }


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

