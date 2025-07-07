import os

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
import stripe
from data_models.pricing_model import UpdatePriceModel, UpdateDiscountRequest, FullPricingModel, StripeProductCreate, \
    StripeProductUpdate
from databases.mongo import db
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()
# Stripe configuration from environment variables
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
SUCCESS_URL = os.getenv("SUCCESS_URL", "http://localhost/success")
CANCEL_URL = os.getenv("CANCEL_URL", "http://localhost/cancel")

if not STRIPE_SECRET_KEY:
    raise RuntimeError("Missing STRIPE_SECRET_KEY environment variable")

stripe.api_key = STRIPE_SECRET_KEY
pricing_router = APIRouter(prefix="/pricing", tags=["Ad Pricing"])
ad_pricing_collection = db["ad_pricing"]
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
# ----------------------------
# Get current prices with applied discounts
# ----------------------------
# @pricing_router.get("/")
# async def get_ad_prices():
#     current_date = datetime.utcnow().date()
#     result = {}
#
#     async for doc in ad_pricing_collection.find():
#         base_price = doc.get("base_price", 0)
#         discount = doc.get("discount", {})
#         effective_price = base_price
#         discount_applied = None
#
#         if discount:
#             try:
#                 start = datetime.strptime(discount["start_date"], "%Y-%m-%d").date()
#                 end = datetime.strptime(discount["end_date"], "%Y-%m-%d").date()
#                 if start <= current_date <= end:
#                     percent = discount.get("value_percent", 0)
#                     effective_price = round(base_price * (1 - percent / 100), 2)
#                     discount_applied = discount
#             except:
#                 pass
#
#         result[doc["type"]] = {
#             "base_price": base_price,
#             "discount_applied": discount_applied,
#             "effective_price": effective_price
#         }
#
#     if not result:
#         raise HTTPException(status_code=200, detail="No pricing info found")
#
#     return result

# ----------------------------
# Update base price for ad type
# ----------------------------
# @pricing_router.put("/update-price")
# async def update_base_price(data: UpdatePriceModel,  # ← image files uploaded
#     token: str = Depends(oauth2_scheme),):
#     result = await ad_pricing_collection.update_one(
#         {"type": data.ad_type},
#         {"$set": {"base_price": data.base_price}},
#         upsert=True
#     )
#
#     if result.modified_count == 0 and result.upserted_id is None:
#         raise HTTPException(status_code=400, detail="Failed to update base price")
#
#     return {"message": f"{data.ad_type} ad price updated to {data.base_price}"}

# ----------------------------
# Update or add seasonal discount
# ----------------------------
# @pricing_router.put("/update-discount")
# async def update_discount(data: UpdateDiscountRequest,  # ← image files uploaded
#     token: str = Depends(oauth2_scheme),):
#     try:
#         # Validate date format
#         datetime.strptime(data.start_date, "%Y-%m-%d")
#         datetime.strptime(data.end_date, "%Y-%m-%d")
#     except ValueError:
#         raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
#
#     result = await ad_pricing_collection.update_one(
#         {"type": data.ad_type},
#         {"$set": {
#             "discount": {
#                 "value_percent": data.value_percent,
#                 "start_date": data.start_date,
#                 "end_date": data.end_date
#             }
#         }},
#         upsert=True
#     )
#
#     if result.modified_count == 0 and result.upserted_id is None:
#         raise HTTPException(status_code=400, detail="Failed to update discount")
#
#     return {"message": f"Discount for {data.ad_type} updated successfully"}
# @pricing_router.post("/add-price")
# async def add_ad_price(
#     data: FullPricingModel,
#     token: str = Depends(oauth2_scheme),
# ):
#     try:
#         # Optional: Check if a pricing document already exists (e.g. only allow one doc)
#         existing = await ad_pricing_collection.find_one({})
#         if existing:
#             raise HTTPException(status_code=400, detail="Pricing data already exists. Use update instead.")
#
#         # Insert full pricing document
#         await ad_pricing_collection.insert_one(data.model_dump())
#
#         return {"message": "Full pricing added successfully."}
#
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to add pricing: {str(e)}")

@pricing_router.post("/stripe-price/create")
async def create_price(data: StripeProductCreate):
    try:
        # 1. Create product
        product = stripe.Product.create(name=data.name, description=data.description)

        # 2. Create price (recurring or one-time)
        price_params = {
            "unit_amount": data.amount,
            "currency": data.currency,
            "product": product.id,
        }

        if data.recurring_interval:
            price_params["recurring"] = {"interval": data.recurring_interval}

        price = stripe.Price.create(**price_params)

        return {
            "product_id": product.id,
            "price_id": price.id,
            "unit_amount": price.unit_amount,
            "currency": price.currency
        }
    except Exception as e:
        print(f"Create price error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create price")

@pricing_router.get("/stripe-price/{price_id}")
async def get_price(price_id: str):
    try:
        price = stripe.Price.retrieve(price_id)
        product = stripe.Product.retrieve(price.product)
        return {
            "price_id": price.id,
            "amount": price.unit_amount,
            "currency": price.currency,
            "recurring": price.recurring,
            "product": {
                "id": product.id,
                "name": product.name,
                "description": product.description
            }
        }
    except Exception as e:
        print(f"Read price error: {e}")
        raise HTTPException(status_code=404, detail="Price not found")

@pricing_router.put("/stripe-product/{product_id}")
async def update_product(product_id: str, data: StripeProductUpdate):
    try:
        update_payload = data.dict(exclude_none=True)
        updated_product = stripe.Product.modify(product_id, **update_payload)
        return {"message": "Product updated", "product": updated_product}
    except stripe.error.InvalidRequestError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {e.user_message or str(e)}")
    except Exception as e:
        print(f"Update product error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update product")


@pricing_router.delete("/stripe-price/{price_id}")
async def deactivate_price(price_id: str):
    try:
        price = stripe.Price.modify(price_id, active=False)
        return {"message": "Price deactivated", "price_id": price.id}
    except Exception as e:
        print(f"Deactivate price error: {e}")
        raise HTTPException(status_code=500, detail="Failed to deactivate price")
@pricing_router.get("/all")
async def get_all_prices():
    try:
        prices = stripe.Price.list(active=True, limit=100)  # Adjust limit as needed
        result = []

        for price in prices.auto_paging_iter():
            try:
                product = stripe.Product.retrieve(price.product)
                result.append({
                    "price_id": price.id,
                    "amount": price.unit_amount,
                    "currency": price.currency,
                    "recurring": price.recurring,
                    "product": {
                        "id": product.id,
                        "name": product.name,
                        "description": product.description
                    }
                })
            except stripe.error.StripeError as e:
                print(f"Error fetching product for price {price.id}: {e}")
                continue

        return {"prices": result}

    except Exception as e:
        print(f"Error retrieving prices: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve Stripe prices")