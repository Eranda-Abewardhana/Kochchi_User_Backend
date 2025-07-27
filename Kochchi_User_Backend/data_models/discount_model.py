from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Discount(BaseModel):
    type: str = Field(...)  # Enum-like: top_ad, carousel_ad, popup, base
    name: str
    percentage: float = Field(..., ge=0, le=100)
    startDate: datetime
    endDate: datetime
    active: bool = True

class DiscountResponse(Discount):
    id: str

class CreateDiscountResponse(BaseModel):
    message: str
    discount_id: str

class ErrorResponse(BaseModel):
    detail: str
