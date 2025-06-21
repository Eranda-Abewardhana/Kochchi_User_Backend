import os
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from google.oauth2 import id_token
from google.auth.transport import requests
from data_models.auth_model import (
    TokenResponse, RegisterRequest, LoginRequest, GoogleLoginRequest,
    ErrorResponse, CreateAdminRequest, ChangePasswordRequest, UserResponse, EmailVerificationRequest,
    ResendVerificationRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from services.email_service import email_service
from utils.auth.auth_utils import generate_verification_token, get_verification_expiry
from utils.auth.jwt_functions import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_super_admin, get_admin_or_super
)
from databases.mongo import db

auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
users_collection = db["users"]

@auth_router.post("/register", status_code=201)
async def register_user(user: RegisterRequest):
    # Check if user already exists
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    # Generate verification token
    verification_token = generate_verification_token()
    verification_expires = get_verification_expiry()

    user_data = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "hashed_password": hash_password(user.password),
        "role": "user",
        "created_at": datetime.utcnow(),
        "is_active": True,
        "is_verified": False,
        "verification_token": verification_token,
        "verification_expires": verification_expires
    }

    try:
        # Insert user into database
        result = await users_collection.insert_one(user_data)

        # Send verification email
        await email_service.send_verification_email(
            user.email,
            verification_token,
            user.first_name
        )

        return {
            "message": "Registration successful! Please check your email to verify your account.",
            "email": user.email
        }

    except HTTPException:
        # If email sending failed, remove user and re-raise
        await users_collection.delete_one({"email": user.email})
        raise
    except Exception as e:
        # If database insertion fails, clean up
        await users_collection.delete_one({"email": user.email})
        raise HTTPException(
            status_code=500,
            detail="Registration failed. Please try again."
        )


@auth_router.post("/verify-email")
async def verify_email(request: EmailVerificationRequest):
    # Find user by verification token
    user = await users_collection.find_one({
        "verification_token": request.token,
        "verification_expires": {"$gt": datetime.utcnow()}
    })

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification token"
        )

    # Update user as verified and remove verification token
    await users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"is_verified": True, "updated_at": datetime.utcnow()},
            "$unset": {"verification_token": "", "verification_expires": ""}
        }
    )

    # Send welcome email (non-blocking)
    await email_service.send_welcome_email(user["email"], user["first_name"])

    return {"message": "Email verified successfully! You can now log in."}

@auth_router.post("/resend-verification")
async def resend_verification_email(request: ResendVerificationRequest):
    # Find unverified user
    user = await users_collection.find_one({
        "email": request.email,
        "is_verified": False
    })

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found or already verified"
        )

    # Generate new verification token
    verification_token = generate_verification_token()
    verification_expires = get_verification_expiry()

    # Update user with new token
    await users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "verification_token": verification_token,
                "verification_expires": verification_expires,
                "updated_at": datetime.utcnow()
            }
        }
    )

    # Send new verification email
    await email_service.send_verification_email(
        request.email,
        verification_token,
        user["first_name"]
    )

    return {"message": "Verification email sent successfully!"}


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

    # Check if email is verified (skip for admins)
    if user.get("role") == "user" and not user.get("is_verified", False):
        raise HTTPException(
            status_code=401,
            detail="Please verify your email address before logging in. Check your inbox for verification link."
        )

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
    """List all admins (super admin only)"""
    admins = []
    async for admin in users_collection.find({"role": {"$in": ["admin", "super_admin"]}}):
        admin["_id"] = str(admin["_id"])
        admins.append(admin)
    return admins


# ---------------- Password Reset Endpoints ----------------

@auth_router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Request password reset email"""
    # Find user by email
    user = await users_collection.find_one({"email": request.email})
    
    if not user:
        # Don't reveal if user exists or not for security
        return {"message": "If an account with that email exists, a password reset link has been sent."}
    
    # Generate password reset token
    reset_token = generate_verification_token()
    reset_expires = datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
    
    # Update user with reset token
    await users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password_reset_token": reset_token,
                "password_reset_expires": reset_expires,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    try:
        # Send password reset email
        await email_service.send_password_reset_email(
            request.email,
            reset_token,
            user["first_name"]
        )
        
        return {"message": "If an account with that email exists, a password reset link has been sent."}
        
    except Exception as e:
        # If email sending fails, remove the reset token
        await users_collection.update_one(
            {"_id": user["_id"]},
            {
                "$unset": {"password_reset_token": "", "password_reset_expires": ""},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to send password reset email. Please try again."
        )


@auth_router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password using token"""
    # Find user by reset token
    user = await users_collection.find_one({
        "password_reset_token": request.token,
        "password_reset_expires": {"$gt": datetime.utcnow()}
    })
    
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )
    
    # Hash new password
    hashed_password = hash_password(request.new_password)
    
    # Update user password and remove reset token
    await users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "hashed_password": hashed_password,
                "updated_at": datetime.utcnow()
            },
            "$unset": {"password_reset_token": "", "password_reset_expires": ""}
        }
    )
    
    return {"message": "Password reset successfully! You can now log in with your new password."}