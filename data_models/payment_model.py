from pydantic import BaseModel, Field
from typing import Literal, List, Optional


class PaymentRequest(BaseModel):
    ad_id: str
    ad_type: Literal["top", "normal"]
    amount: float
    currency: str = "LKR"
    description: str
    customer_name: str
    customer_email: str
    price_ids: List[str]  # <-- Add this field
    coupon_code: Optional[str] = None  # Optional coupon support

class RefundRequest(BaseModel):
    payment_intent_id: str
