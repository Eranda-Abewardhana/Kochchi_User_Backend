from fastapi import APIRouter, Request, Header, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import stripe

from data_models.payment_model import PaymentRequest

# ✅ Load .env variables
load_dotenv()

payment_router = APIRouter(prefix="/api/payments", tags=["Payments"])

# ✅ Stripe configuration
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
stripe.api_key = STRIPE_SECRET_KEY

# ✅ Initiate payment request
@payment_router.post("/initiate")
async def initiate_payment(data: PaymentRequest):
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': data.currency.lower(),
                    'unit_amount': int(data.amount * 100),
                    'product_data': {
                        'name': data.description,
                    },
                },
                'quantity': 1,
            }],
            customer_email=data.customer_email,
            mode='payment',
            success_url=os.getenv("SUCCESS_URL"),
            cancel_url=os.getenv("CANCEL_URL"),
        )
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe payment initiation failed: {e}")

# ✅ Webhook callback for Stripe events
@payment_router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        print("✅ Payment successful:", session)

    return {"status": "success"}

# ✅ Refund (Rollback) payment request
class RefundRequest(BaseModel):
    payment_intent_id: str  # This comes from Stripe after payment

@payment_router.post("/refund")
async def refund_payment(refund_request: RefundRequest):
    try:
        refund = stripe.Refund.create(
            payment_intent=refund_request.payment_intent_id
        )
        return {"status": "refund_initiated", "refund_id": refund.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refund failed: {e}")
