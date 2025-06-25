from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer

from data_models.pricing_model import UpdatePriceModel, UpdateDiscountRequest, FullPricingModel
from databases.mongo import db
from datetime import datetime

pricing_router = APIRouter(prefix="/pricing", tags=["Ad Pricing"])
ad_pricing_collection = db["ad_pricing"]
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
# ----------------------------
# Get current prices with applied discounts
# ----------------------------
@pricing_router.get("/")
async def get_ad_prices():
    current_date = datetime.utcnow().date()
    result = {}

    async for doc in ad_pricing_collection.find():
        base_price = doc.get("base_price", 0)
        discount = doc.get("discount", {})
        effective_price = base_price
        discount_applied = None

        if discount:
            try:
                start = datetime.strptime(discount["start_date"], "%Y-%m-%d").date()
                end = datetime.strptime(discount["end_date"], "%Y-%m-%d").date()
                if start <= current_date <= end:
                    percent = discount.get("value_percent", 0)
                    effective_price = round(base_price * (1 - percent / 100), 2)
                    discount_applied = discount
            except:
                pass

        result[doc["type"]] = {
            "base_price": base_price,
            "discount_applied": discount_applied,
            "effective_price": effective_price
        }

    if not result:
        raise HTTPException(status_code=200, detail="No pricing info found")

    return result

# ----------------------------
# Update base price for ad type
# ----------------------------
@pricing_router.put("/update-price")
async def update_base_price(data: UpdatePriceModel,  # ← image files uploaded
    token: str = Depends(oauth2_scheme),):
    result = await ad_pricing_collection.update_one(
        {"type": data.ad_type},
        {"$set": {"base_price": data.base_price}},
        upsert=True
    )

    if result.modified_count == 0 and result.upserted_id is None:
        raise HTTPException(status_code=400, detail="Failed to update base price")

    return {"message": f"{data.ad_type} ad price updated to {data.base_price}"}

# ----------------------------
# Update or add seasonal discount
# ----------------------------
@pricing_router.put("/update-discount")
async def update_discount(data: UpdateDiscountRequest,  # ← image files uploaded
    token: str = Depends(oauth2_scheme),):
    try:
        # Validate date format
        datetime.strptime(data.start_date, "%Y-%m-%d")
        datetime.strptime(data.end_date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    result = await ad_pricing_collection.update_one(
        {"type": data.ad_type},
        {"$set": {
            "discount": {
                "value_percent": data.value_percent,
                "start_date": data.start_date,
                "end_date": data.end_date
            }
        }},
        upsert=True
    )

    if result.modified_count == 0 and result.upserted_id is None:
        raise HTTPException(status_code=400, detail="Failed to update discount")

    return {"message": f"Discount for {data.ad_type} updated successfully"}
@pricing_router.post("/add-price")
async def add_ad_price(
    data: FullPricingModel,
    token: str = Depends(oauth2_scheme),
):
    try:
        # Optional: Check if a pricing document already exists (e.g. only allow one doc)
        existing = await ad_pricing_collection.find_one({})
        if existing:
            raise HTTPException(status_code=400, detail="Pricing data already exists. Use update instead.")

        # Insert full pricing document
        await ad_pricing_collection.insert_one(data.model_dump())

        return {"message": "Full pricing added successfully."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add pricing: {str(e)}")
