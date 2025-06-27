import os
import stripe
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from data_models.payment_model import PaymentRequest, RefundRequest

# Initialize router
payment_router = APIRouter(prefix="/payments", tags=["Payments"])

# Stripe configuration from environment variables
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
SUCCESS_URL = os.getenv("SUCCESS_URL", "http://localhost/success")
CANCEL_URL = os.getenv("CANCEL_URL", "http://localhost/cancel")

if not STRIPE_SECRET_KEY:
    raise RuntimeError("Missing STRIPE_SECRET_KEY environment variable")

stripe.api_key = STRIPE_SECRET_KEY

# Initiate payment request
@payment_router.post("/initiate")
async def initiate_payment(data: PaymentRequest):
    try:
        # Convert each price_id into a line_item
        line_items = [{"price": pid, "quantity": 1} for pid in data.price_ids]

        checkout_params = {
            "payment_method_types": ["card"],
            "line_items": line_items,
            "mode": "payment",
            "customer_email": data.customer_email,
            "success_url": SUCCESS_URL,
            "cancel_url": CANCEL_URL,
            "metadata": {
                "ad_id": data.ad_id,
                "customer_name": data.customer_name
            }
        }

        if data.coupon_code:
            promo_codes = stripe.PromotionCode.list(code=data.coupon_code, active=True)
            if not promo_codes.data:
                raise HTTPException(status_code=400, detail="Invalid or expired coupon code")
            coupon_id = promo_codes.data[0]["id"]
            checkout_params["discounts"] = [{"promotion_code": coupon_id}]

        session = stripe.checkout.Session.create(**checkout_params)

        return {
            "checkout_url": session.url,
            "session_id": session.id
        }

    except Exception as e:
        print(f"Stripe initiation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to initiate payment")


# --- Stripe Webhook to Handle Events ---
@payment_router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        print(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail="Webhook error")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        ad_id = session["metadata"].get("ad_id")
        print(f"✅ Payment complete for ad ID: {ad_id}")

        # TODO: Update your ad as paid in database here

    return {"status": "success"}

@payment_router.post("/refund")
async def refund_payment(refund_request: RefundRequest):
    try:
        refund = stripe.Refund.create(payment_intent=refund_request.payment_intent_id)
        return {"status": "refund_initiated", "refund_id": refund.id}
    except Exception as e:
        print(f"Refund error: {e}")
        raise HTTPException(status_code=500, detail="Refund failed")
