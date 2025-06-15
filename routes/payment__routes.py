from fastapi import APIRouter, Request, Header, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import requests
from data_models.payment_model import PaymentRequest

# ✅ Load .env variables
load_dotenv()

payment_router = APIRouter(prefix="/api/payments", tags=["Payments"])

# ✅ Environment variables
ONEPAY_API_URL = os.getenv("ONEPAY_API_URL")
APP_ID = os.getenv("APP_ID")
API_KEY = os.getenv("API_KEY")
CALLBACK_TOKEN = os.getenv("CALLBACK_TOKEN")
REDIRECT_URL = os.getenv("REDIRECT_URL")

# ✅ Initiate payment route
@payment_router.post("/initiate")
async def initiate_payment(data: PaymentRequest):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "appId": APP_ID,
        "amount": data.amount,
        "currency": data.currency,
        "description": data.description,
        "customer": {
            "name": data.customer_name,
            "email": data.customer_email
        },
        "redirectUrl": REDIRECT_URL,
        "callbackUrl": f"{os.getenv('CALLBACK_URL')}/api/payments/callback"
    }

    try:
        response = requests.post(ONEPAY_API_URL, json=payload, headers=headers)
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment initiation failed: {e}")

# ✅ Webhook callback
@payment_router.post("/callback")
async def payment_callback(request: Request, x_callback_token: str = Header(None)):
    if x_callback_token != CALLBACK_TOKEN:
        raise HTTPException(status_code=403, detail="Unauthorized callback")

    data = await request.json()
    print("✅ Callback received:", data)

    return {"status": "received"}
