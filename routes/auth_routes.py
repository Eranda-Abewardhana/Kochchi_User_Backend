import os
from datetime import datetime
from typing import Union

from fastapi import APIRouter, HTTPException, status, Depends, Body
from fastapi.security import OAuth2PasswordRequestForm
from google.oauth2 import id_token
from google.auth.transport import requests
from data_models.auth_model import (
    TokenResponse, RegisterRequest, LoginRequest, GoogleLoginRequest,
    ErrorResponse, CreateAdminRequest, ChangePasswordRequest, UserResponse
)
from utils.auth.jwt_functions import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_super_admin, get_admin_or_super
)
from databases.mongo import db

auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
users_collection = db["users"]


# ---------------- Regular User Registration ----------------
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
        "role": "user",
        "created_at": datetime.utcnow(),
        "is_active": True
    }

    await users_collection.insert_one(user_data)
    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "user"
    }


# ---------------- Login (Universal) ----------------

@auth_router.post("/login", response_model=TokenResponse, responses={401: {"model": ErrorResponse}})
async def login_user(credentials: LoginRequest):
    # Find user by username or email
    user = await users_collection.find_one({
        "$or": [
            {"username": credentials.username},
            {"email": credentials.username}
        ]
    })

    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account is inactive")

    # Use username for admins, email for regular users
    identifier = user.get("username") if user.get("role") in ["admin", "super_admin"] else user["email"]
    token = create_access_token({"sub": identifier})

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user["role"],
        "username": user.get("username")
    }

# ---------------- Google Login (Regular Users Only) ----------------
@auth_router.post("/google", response_model=TokenResponse)
async def google_login(payload: GoogleLoginRequest):
    try:
        idinfo = id_token.verify_oauth2_token(payload.google_id_token, requests.Request(), GOOGLE_CLIENT_ID)

        user_email = idinfo["email"]
        first_name = idinfo.get("given_name", "")
        last_name = idinfo.get("family_name", "")
        profile_pic = idinfo.get("picture", "")

        user = await users_collection.find_one({"email": user_email})
        if not user:
            user_data = {
                "first_name": first_name,
                "last_name": last_name,
                "email": user_email,
                "phone_number": "",
                "profile_pic": profile_pic,
                "hashed_password": "",
                "role": "user",
                "created_at": datetime.utcnow(),
                "is_active": True
            }
            await users_collection.insert_one(user_data)

        token = create_access_token({"sub": user_email})
        return {
            "access_token": token,
            "token_type": "bearer",
            "role": "user"
        }

    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google ID token")


# ---------------- Super Admin: Create Admin ----------------
@auth_router.post("/create-admin", response_model=UserResponse, status_code=201)
async def create_admin(
        admin_data: CreateAdminRequest,
        current_user: dict = Depends(get_super_admin)
):
    # Check if username already exists
    existing = await users_collection.find_one({"username": admin_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Check if email exists (if provided)
    if admin_data.email:
        existing_email = await users_collection.find_one({"email": admin_data.email})
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already exists")

    new_admin = {
        "username": admin_data.username,
        "first_name": admin_data.first_name,
        "last_name": admin_data.last_name,
        "email": admin_data.email,
        "phone_number": admin_data.phone_number,
        "profile_pic": admin_data.profile_pic,
        "hashed_password": hash_password(admin_data.password),
        "role": "admin",
        "created_by": current_user["username"],
        "created_at": datetime.utcnow(),
        "is_active": True
    }

    await users_collection.insert_one(new_admin)

    return {
        "username": new_admin["username"],
        "email": new_admin["email"],
        "first_name": new_admin["first_name"],
        "last_name": new_admin["last_name"],
        "role": new_admin["role"],
        "is_active": new_admin["is_active"]
    }


# ---------------- Change Password----------------
@auth_router.put("/change-password")
async def change_password(
        password_data: ChangePasswordRequest,
        current_user: dict = Depends(get_current_user)
):
    # Verify current password
    if not verify_password(password_data.current_password, current_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Update password
    new_hashed_password = hash_password(password_data.new_password)
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "hashed_password": new_hashed_password,
                "updated_at": datetime.utcnow()
            }
        }
    )

    return {"message": "Password updated successfully"}


# ---------------- Get Current User Info ----------------
@auth_router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user.get("username"),
        "email": current_user.get("email"),
        "first_name": current_user["first_name"],
        "last_name": current_user["last_name"],
        "role": current_user["role"],
        "is_active": current_user.get("is_active", True)
    }


# ---------------- List Admins (Super Admin Only) ----------------
@auth_router.get("/admins")
async def list_admins(current_user: dict = Depends(get_super_admin)):
    admins = await users_collection.find(
        {"role": "admin"},
        {"hashed_password": 0}  # Exclude password field
    ).to_list(None)

    return admins