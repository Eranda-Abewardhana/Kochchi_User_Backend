import os
import stripe
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from data_models.payment_model import PaymentRequest

# Initialize router
payment_router = APIRouter(prefix="/api/payments", tags=["Payments"])

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

# Webhook callback for Stripe events
@payment_router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        print("Invalid webhook signature")
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    except Exception as e:
        print(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail="Webhook processing failed")

    # Process event types
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        print("✅ Payment completed:", session)

    return {"status": "success"}

# Refund (Rollback) payment request
class RefundRequest(BaseModel):
    payment_intent_id: str  # This comes from Stripe after payment

@payment_router.post("/refund")
async def refund_payment(refund_request: RefundRequest):
    try:
        refund = stripe.Refund.create(payment_intent=refund_request.payment_intent_id)
        return {"status": "refund_initiated", "refund_id": refund.id}
    except Exception as e:
        print(f"Refund failed: {e}")
        raise HTTPException(status_code=500, detail="Refund failed")
