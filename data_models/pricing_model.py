from typing import Optional, Dict, List
from pydantic import BaseModel, Field, HttpUrl


class DiscountModel(BaseModel):
    value_percent: float = Field(..., example=10)
    start_date: str = Field(..., example="2025-07-01")
    end_date: str = Field(..., example="2025-07-15")


class AdTypePrice(BaseModel):
    price: float = Field(..., example=500.0)
    discount_applied: Optional[DiscountModel] = None


class FullPricingModel(BaseModel):
    base_price: AdTypePrice
    top_add_price: AdTypePrice
    carosal_add_price: AdTypePrice

class UpdateSinglePrice(BaseModel):
    price: float = Field(..., example=100.0)


class UpdatePriceModel(BaseModel):
    base_price: Optional[UpdateSinglePrice] = None
    top_add_price: Optional[UpdateSinglePrice] = None
    carosal_add_price: Optional[UpdateSinglePrice] = None

class DiscountData(BaseModel):
    value_percent: float = Field(..., example=10)
    start_date: str = Field(..., example="2025-07-01")  # Format: YYYY-MM-DD
    end_date: str = Field(..., example="2025-07-10")


class UpdateDiscountRequest(BaseModel):
    base_price: Optional[DiscountData] = None
    top_add_price: Optional[DiscountData] = None
    carosal_add_price: Optional[DiscountData] = None

class StripeProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    amount: int  # in cents
    currency: str = "lkr"
    recurring_interval: Optional[str] = None  # 'month', 'year', etc.

class StripeProductUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]
    active: Optional[bool]
    metadata: Optional[Dict[str, str]]
    images: Optional[List[HttpUrl]]
    default_price: Optional[str]  # Can be set to a different price ID
    statement_descriptor: Optional[str]

    class Config:
        extra = "forbid"  # Disallow unrecognized fields