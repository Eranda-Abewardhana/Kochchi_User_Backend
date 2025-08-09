from fastapi import Form
from pydantic import BaseModel, EmailStr, HttpUrl, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class Contact(BaseModel):
    address: Any
    phone: Any
    whatsapp: Any
    email: Any
    website: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False


class Location(BaseModel):
    googleMapLocation: Any
    city: Any
    district: Any
    province: Any
    country: Any
    state: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False


class Business(BaseModel):
    category: Any
    specialty: Any
    tags: Any
    halalAvailable: Any
    description: Any
    menuOptions: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False


class Schedule(BaseModel):
    mon: Any
    tue: Any
    wed: Any
    thu: Any
    fri: Any
    sat: Any
    sun: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False


class AdSettings(BaseModel):
    isTopAd: Any
    isCarousalAd: Any
    hasHalal: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False


class Approval(BaseModel):
    status: Any
    adminId: Any
    adminComment: Any
    approvedAt: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False


class ReactionsGroup(BaseModel):
    count: Any
    userIds: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False


class Reactions(BaseModel):
    likes: Any
    unlikes: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False


class Recommendations(BaseModel):
    count: Any
    userIds: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False


class AdBase(BaseModel):
    shopName: Any
    contact: Any
    location: Any
    business: Any
    schedule: Any
    adSettings: Any
    images: Any  # Image URLs
    videoUrl: Any
    approval: Any
    reactions: Any
    recommendations: Any
    visibility: Any  # "visible" or "hidden"
    expiryDate: Any
    createdAt: Any
    updatedAt: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False


# ✅ Response Models

class PaymentInfo(BaseModel):
    checkout_url: Any
    session_id: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False

class AdCreateResponse(BaseModel):
    message: Any
    adId: Any
    images: Any
    payment: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False


class AdDeleteResponse(BaseModel):
    message: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False


class AdApprovalResponse(BaseModel):
    ad_id: Any
    status: Any
    comment: Any
    approved_by: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False


class ErrorResponse(BaseModel):
    detail: Any
    status_code: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False

class TopAdPreview(BaseModel):
    ad_id: Any
    title: Any
    image_url: Any
    city: Any
    district: Any
    category: Any
    contact_name: Any
    contact_phone: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False

class AdListingPreview(BaseModel):
    ad_id: Any
    title: Any
    image_url: Any
    priority_score: Any

    # Flattened AdBase
    shopName: Any

    # Contact
    contact_address: Any
    contact_phone: Any
    contact_whatsapp: Any
    contact_email: Any
    contact_website: Any

    # Location
    location_googleMapLocation: Any
    location_city: Any
    location_district: Any
    location_province: Any
    location_country: Any
    location_state: Any

    # Business
    business_category: Any
    business_specialty: Any
    business_tags: Any
    business_halalAvailable: Any
    business_description: Any
    business_menuOptions: Any

    # Schedule (flattened per day)
    schedule_mon: Any
    schedule_tue: Any
    schedule_wed: Any
    schedule_thu: Any
    schedule_fri: Any
    schedule_sat: Any
    schedule_sun: Any

    # AdSettings
    isTopAd: Any
    isCarousalAd: Any
    hasHalal: Any

    # Images
    images: Any
    videoUrl: Any

    # Approval
    approval_status: Any
    approval_adminId: Any
    approval_adminComment: Any
    approval_approvedAt: Any

    # Reactions
    likes_count: Any
    likes_userIds: Any
    unlikes_count: Any
    unlikes_userIds: Any

    # Recommendations
    recommendations_count: Any
    recommendations_userIds: Any

    visibility: Any
    expiryDate: Any
    createdAt: Any
    updatedAt: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False

class AdOut(BaseModel):
    title: Any
    description: Any
    images: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False


class PaginatedAdResponse(BaseModel):
    page: Any
    total_pages: Any
    total_ads: Any
    results: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False
class AdCreateSchema(BaseModel):
    shopName: Any
    contact: Any
    location: Any
    business: Any
    schedule: Any
    adSettings: Any
    videoUrl: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False

class ApprovedAdPreview(BaseModel):
    shopId: Any
    shopName: Any
    city: Any
    image: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False

class ApprovedAdListResponse(BaseModel):
    message: Any
    approvedAds: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False

class AdListResponse(BaseModel):
    message: Any
    ads: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False
class SimplifiedAdPreview(BaseModel):
    ad_id: Any
    title: Any
    image_url: Any
    city: Any
    district: Any
    category: Any
    contact_name: Any
    contact_phone: Any
    priority_score: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False
class PartialAd(BaseModel):
    title: Any
    description: Any
    business: Any
    contact: Any
    adSettings: Any
    schedule: Any
    location: Any
    updatedAt: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False

class AdUpdateResponse(BaseModel):
    message: Any
    adId: Any
    updatedFields: Any

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False

class AdUpdateSchema(BaseModel):
    title: Optional[Any] = None
    description: Optional[Any] = None
    business: Optional[Any] = None
    contact: Optional[Any] = None
    adSettings: Optional[Any] = None
    schedule: Optional[Any] = None
    location: Optional[Any] = None

    class Config:
        arbitrary_types_allowed = True
        validate_assignment = False

