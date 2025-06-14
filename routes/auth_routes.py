import os
from fastapi import APIRouter, HTTPException, status
from google.oauth2 import id_token
from google.auth.transport import requests
from data_modals.auth_modal import TokenResponse, RegisterRequest, LoginRequest, GoogleLoginRequest, ErrorResponse
from utils.auth.jwt_functions import hash_password, verify_password, create_access_token
from databases.mongo import db

auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

users_collection = db["users"]

# ---------------- Register ----------------
@auth_router.post("/register", response_model=TokenResponse, status_code=201)
async def register_user(user: RegisterRequest):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user_data = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "profile_pic": user.profile_pic,
        "hashed_password": hash_password(user.password),
    }

    await users_collection.insert_one(user_data)
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

# ---------------- Login ----------------
@auth_router.post("/login", response_model=TokenResponse, responses={401: {"model": ErrorResponse}})
async def login_user(credentials: LoginRequest):
    user = await users_collection.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user["email"]})
    return {"access_token": token, "token_type": "bearer"}

# ---------------- Google Login ----------------
@auth_router.post("/google", response_model=TokenResponse)
async def google_login(payload: GoogleLoginRequest):
    try:
        idinfo = id_token.verify_oauth2_token(payload.google_id_token, requests.Request(), GOOGLE_CLIENT_ID)

        user_email = idinfo["email"]
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")
        profile_pic = idinfo.get("picture", "")
        phone_number = ""

        user = await users_collection.find_one({"email": user_email})
        if not user:
            user_data = {
                "first_name": first_name,
                "last_name": last_name,
                "email": user_email,
                "phone_number": phone_number,
                "profile_pic": profile_pic,
                "hashed_password": ""  # Not needed
            }
            await users_collection.insert_one(user_data)

        token = create_access_token({"sub": user_email})
        return {"access_token": token, "token_type": "bearer"}

    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google ID token")
