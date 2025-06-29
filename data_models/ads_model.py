from fastapi import Form
from pydantic import BaseModel, EmailStr, HttpUrl, Field
from typing import List, Optional, Dict
from datetime import datetime


class Contact(BaseModel):
    address: str
    phone: str
    whatsapp: Optional[str]
    email: EmailStr
    website: Optional[HttpUrl]


class Location(BaseModel):
    googleMapLocation: Optional[str]
    city: str
    district: str
    province: Optional[str]
    country: Optional[str] = "Sri Lanka"
    state: Optional[str] = None  # For international listings


class Business(BaseModel):
    category: str  # One of the 8 core categories
    specialty: Optional[str]
    tags: List[str]
    halalAvailable: bool
    description: Optional[str]
    menuOptions: Optional[List[str]] = []  # Only used for restaurant-type ads


class Schedule(BaseModel):
    mon: List[str]
    tue: List[str]
    wed: List[str]
    thu: List[str]
    fri: List[str]
    sat: List[str]
    sun: List[str]


class AdSettings(BaseModel):
    isTopAd: bool = False
    isCarousalAd: bool = False


class Approval(BaseModel):
    status: str  # pending / approved / rejected / inactive
    adminId: Optional[str]
    adminComment: Optional[str]
    approvedAt: Optional[datetime]


class ReactionsGroup(BaseModel):
    count: int = 0
    userIds: List[str] = []


class Reactions(BaseModel):
    likes: ReactionsGroup = ReactionsGroup()
    unlikes: ReactionsGroup = ReactionsGroup()


class Recommendations(BaseModel):
    count: int = 0
    userIds: List[str] = []


class AdBase(BaseModel):
    shopName: str
    contact: Contact
    location: Location
    business: Business
    schedule: Schedule
    adSettings: AdSettings
    images: List[str]  # Image URLs
    videoUrl: Optional[HttpUrl] = None
    approval: Approval
    reactions: Reactions
    recommendations: Optional[Recommendations] = Recommendations()
    visibility: str  # "visible" or "hidden"
    expiryDate: Optional[datetime]
    createdAt: datetime
    updatedAt: datetime


# ✅ Response Models

class AdCreateResponse(BaseModel):
    message: str
    adId: str
    images: List[str]


class AdDeleteResponse(BaseModel):
    message: str


class AdApprovalResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    detail: str
    status_code: Optional[int] = None

class TopAdPreview(BaseModel):
    ad_id: str = Field(...)
    title: str = Field(...)
    image_url: Optional[str] = Field(...)
    city: Optional[str] = Field(...)
    district: Optional[str] = Field(...)
    category: Optional[str] = Field(...)
    contact_name: Optional[str] = Field(...)
    contact_phone: Optional[str] = Field(...)

class AdListingPreview(BaseModel):
    ad_id: str
    title: str
    image_url: Optional[str]
    city: Optional[str]
    district: Optional[str]
    category: Optional[str]
    contact_name: Optional[str]
    contact_phone: Optional[str]
    priority_score: int

class AdOut(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    images: Optional[List[HttpUrl]] = []  # use List[str] if URLs may be unvalidated


class PaginatedAdResponse(BaseModel):
    page: int
    total_pages: int
    total_ads: int
    results: List[AdOut]
class AdCreateSchema(BaseModel):
    shopName: str
    contact: Contact
    location: Location
    business: Business
    schedule: Schedule
    adSettings: AdSettings
    videoUrl: Optional[HttpUrl]

    class Config:
        schema_extra = {
            "example": {
                "shopName": "The Curry Hut",
                "contact": {
                    "address": "123 Main St",
                    "phone": "0771234567",
                    "whatsapp": "0771234567",
                    "email": "example@email.com",
                    "website": "https://curryhut.lk"
                },
                "location": {
                    "googleMapLocation": "6.9271,79.8612",
                    "city": "Colombo",
                    "district": "Colombo",
                    "province": "Western",
                    "country": "Sri Lanka",
                    "state": "N/A"
                },
                "business": {
                    "category": "Restaurant",
                    "specialty": "Indian",
                    "tags": ["Spicy", "Vegetarian"],
                    "halalAvailable": True,
                    "description": "Authentic Sri Lankan and Indian dishes",
                    "menuOptions": ["Rice & Curry", "Biryani"]
                },
                "schedule": {
                    "mon": ["10:00-22:00"],
                    "tue": ["10:00-22:00"],
                    "wed": ["10:00-22:00"],
                    "thu": ["10:00-22:00"],
                    "fri": ["10:00-22:00"],
                    "sat": ["10:00-23:00"],
                    "sun": ["10:00-23:00"]
                },
                "adSettings": {
                    "isTopAd": False,
                    "isCarousalAd": True
                },
                "videoUrl": "https://example.com/video.mp4"
            }
        }
