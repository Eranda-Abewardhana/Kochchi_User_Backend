from pydantic import BaseModel, Field

class UpdatePriceRequest(BaseModel):
    ad_type: str = Field(..., example="top")
    base_price: float = Field(..., example=500.0)

class UpdateDiscountRequest(BaseModel):
    ad_type: str = Field(..., example="normal")
    value_percent: float = Field(..., example=15.0)
    start_date: str = Field(..., example="2025-06-15")  # Format: YYYY-MM-DD
    end_date: str = Field(..., example="2025-06-30")
