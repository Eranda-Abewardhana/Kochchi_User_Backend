from pydantic import BaseModel, EmailStr, HttpUrl, Field
from typing import Optional, List
from datetime import datetime


class DansalContact(BaseModel):
    name: str
    phone: Optional[str]
    whatsapp: Optional[str]
    email: Optional[EmailStr] = None


class DansalLocation(BaseModel):
    city: str
    district: str
    province: Optional[str] = None
    lat: Optional[str] = None
    lon: Optional[str] = None


class DansalEntry(BaseModel):
    id: Optional[str]
    title: str  # e.g., "Dansal for Vesak"
    organizer: DansalContact
    location: DansalLocation
    foodType: str  # e.g., "Rice & Curry", "Ice Cream", "Tea"

    date: str  # e.g., "2025-05-24" (for display)
    time: str  # e.g., "10:00 AM – 2:00 PM" (for display)

    endDateTime: datetime  # 🔥 Used for auto-deletion

    description: Optional[str]
    images: List[str] = []  # Image URLs or local paths

    createdAt: datetime = datetime.utcnow()
    updatedAt: datetime = datetime.utcnow()
    
class DansalRequestModel(BaseModel):
    title: str  # e.g., "Dansal for Vesak"
    organizer: DansalContact
    location: DansalLocation
    foodType: str  # e.g., "Rice & Curry", "Ice Cream", "Tea"

    date: str  # e.g., "2025-05-24" (for display)
    time: str  # e.g., "10:00 AM – 2:00 PM" (for display)

    endDateTime: datetime  # 🔥 Used for auto-deletion

    description: Optional[str]

    createdAt: datetime = datetime.utcnow()
    updatedAt: datetime = datetime.utcnow()