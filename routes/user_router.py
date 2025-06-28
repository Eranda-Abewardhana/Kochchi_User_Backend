import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from data_models.auth_model import  ErrorResponse
from data_models.user_model import UserProfile, UpdateProfileRequest
from utils.auth.jwt_functions import decode_token, hash_password
from databases.mongo import db
from services.file_upload_service import save_uploaded_images

user_router = APIRouter(prefix="/users", tags=["User Profile"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

users_collection = db["users"]
BASE_IMAGE_PATH = "data_sources"

@user_router.get("/me", response_model=UserProfile, responses={401: {"model": ErrorResponse}})
async def get_user_profile(token: str = Depends(oauth2_scheme)):
    email = decode_token(token)
    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return UserProfile(**user)


@user_router.put("/me", response_model=UserProfile, responses={401: {"model": ErrorResponse}})
async def update_user_profile(
    first_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    profile_pic: Optional[UploadFile] = File(None),
    token: str = Depends(oauth2_scheme)
):
    email = decode_token(token)
    user = await users_collection.find_one({"email": email})
    user_id = str(user.inserted_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    update_data = {}

    if first_name:
        update_data["first_name"] = first_name
    if last_name:
        update_data["last_name"] = last_name
    if phone_number:
        update_data["phone_number"] = phone_number
    
    # Handle profile picture upload
    if profile_pic:

        # Save the uploaded image
        # 2️⃣ Upload images to Cloudinary
        profile_pics = []
        profile_pics.append(profile_pic)
        image_urls = save_uploaded_images(profile_pics, cloud_folder=f"profile_pics/{user_id}")
        if image_urls:
            update_data["profile_pic"] = image_urls[0]
    
    if update_data:
        await users_collection.update_one({"email": email}, {"$set": update_data})

    updated_user = await users_collection.find_one({"email": email})
    return UserProfile(**updated_user)
