import os
import stripe
import cloudinary.uploader
from fastapi import APIRouter, Request, HTTPException
from data_models.payment_model import PaymentRequest, RefundRequest
from databases.mongo import db  # <-- Import directly from your database layer
from dotenv import load_dotenv
load_dotenv()
# FastAPI router
payment_router = APIRouter(prefix="/payments", tags=["Payments"])

# Stripe config
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
SUCCESS_URL = os.getenv("SUCCESS_URL", "http://127.0.0.1:8000/payment-success")
CANCEL_URL = os.getenv("CANCEL_URL", "http://127.0.0.1:8000/payment-cancel")

if not STRIPE_SECRET_KEY:
    raise RuntimeError("Missing STRIPE_SECRET_KEY")

stripe.api_key = STRIPE_SECRET_KEY

# Mongo collection
ads_collection = db.get_collection("ads")

# --- Payment Initiation ---
@payment_router.post("/initiate")
async def initiate_payment(data: PaymentRequest):
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": data.currency.lower(),
                    "unit_amount": int(data.amount * 100),
                    "product_data": {
                        "name": data.description,
                    },
                },
                "quantity": 1,
            }],
            customer_email=data.customer_email,
            mode="payment",
            success_url=SUCCESS_URL,
            cancel_url=CANCEL_URL,
        )
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as e:
        print(f"Stripe error during initiation: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate payment")

# --- Stripe Webhook ---
@payment_router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event["type"]
    session = event["data"]["object"]

    if event_type in ["checkout.session.expired", "checkout.session.async_payment_failed"]:
        session_id = session.get("id")
        ad = await ads_collection.find_one({"stripeSessionId": session_id})
        if ad:
            await ads_collection.delete_one({"_id": ad["_id"]})
            for url in ad.get("images", []):
                try:
                    parts = url.split("/")
                    public_id = "/".join(parts[parts.index("ads"):-1]) + "/" + parts[-1].split(".")[0]
                    cloudinary.uploader.destroy(public_id)
                except Exception as ce:
                    print(f"Cloudinary cleanup failed: {ce}")

    elif event_type == "checkout.session.completed":
        session_id = session.get("id")
        await ads_collection.update_one(
            {"stripeSessionId": session_id},
            {"$set": {"visibility": "visible"}}
        )

    return {"status": "ok"}

# --- Refund Handler ---
@payment_router.post("/refund")
async def refund_payment(refund_request: RefundRequest):
    try:
        refund = stripe.Refund.create(payment_intent=refund_request.payment_intent_id)
        return {"status": "refund_initiated", "refund_id": refund.id}
    except Exception as e:
        print(f"Refund error: {e}")
        raise HTTPException(status_code=500, detail="Refund failed")

# --- Session Creator Helper ---
def create_stripe_checkout_session(data: dict) -> dict:
    try:
        discounts = []
        if data.get("coupon_code"):
            try:
                promo_list = stripe.PromotionCode.list(code=data["coupon_code"], active=True, limit=1)
                if promo_list.data:
                    promo_code = promo_list.data[0]
                    discounts.append({"promotion_code": promo_code.id})
            except Exception as ce:
                print(f"Promo validation failed: {ce}")

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": data["currency"].lower(),
                    "unit_amount": int(data["amount"] * 100),
                    "product_data": {
                        "name": data["description"],
                    },
                },
                "quantity": 1,
            }],
            customer_email=data["customer_email"],
            mode="payment",
            success_url=SUCCESS_URL,
            cancel_url=CANCEL_URL,
            discounts=discounts if discounts else None,
        )
        return {"checkout_url": session.url, "session_id": session.id}

    except Exception as e:
        print(f"Stripe error during session creation: {e}")
        raise HTTPException(status_code=500, detail="Stripe session creation failed")
