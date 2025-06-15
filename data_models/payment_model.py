from pydantic import BaseModel, Field
from typing import Literal

class PaymentRequest(BaseModel):
    ad_id: str = Field(...)  # MongoDB ObjectId as string
    ad_type: Literal["top", "normal"] = Field(...)  # restricts to valid options
    amount: float = Field(...)  # now included explicitly
    currency: str = Field(default="LKR")
    description: str = Field(...)
    customer_name: str = Field(...)
    customer_email: str = Field(...)
