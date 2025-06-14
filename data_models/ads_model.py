from pydantic import BaseModel, EmailStr, HttpUrl
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
    province: str


class Business(BaseModel):
    category: str
    specialty: Optional[str]
    tags: List[str]
    halalAvailable: bool
    description: Optional[str]


class Schedule(BaseModel):
    mon: List[str]
    tue: List[str]
    wed: List[str]
    thu: List[str]
    fri: List[str]
    sat: List[str]
    sun: List[str]


class AdSettings(BaseModel):
    isTopAd: bool


class Approval(BaseModel):
    status: str  # pending / approved / rejected
    adminId: Optional[str]
    adminComment: Optional[str]
    approvedAt: Optional[datetime]


class ReactionsGroup(BaseModel):
    count: int = 0
    userIds: List[str] = []


class Reactions(BaseModel):
    likes: ReactionsGroup
    unlikes: ReactionsGroup


class AdBase(BaseModel):
    shopName: str
    contact: Contact
    location: Location
    business: Business
    schedule: Schedule
    adSettings: AdSettings
    images: List[str]  #image URLs
    approval: Approval
    reactions: Reactions
    visibility: str  # "visible" or "hidden"
    createdAt: datetime
    updatedAt: datetime

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
