from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from data_models.auth_model import  ErrorResponse
from data_models.user_model import UserProfile, UpdateProfileRequest
from utils.auth.jwt_functions import decode_token, hash_password
from databases.mongo import db

user_router = APIRouter(prefix="/api/users", tags=["User Profile"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

users_collection = db["users"]

@user_router.get("/me", response_model=UserProfile, responses={401: {"model": ErrorResponse}})
async def get_user_profile(token: str = Depends(oauth2_scheme)):
    email = decode_token(token)
    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return UserProfile(**user)


@user_router.put("/me", response_model=UserProfile, responses={401: {"model": ErrorResponse}})
async def update_user_profile(data: UpdateProfileRequest, token: str = Depends(oauth2_scheme)):
    email = decode_token(token)
    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    update_data = {}

    if data.first_name:
        update_data["first_name"] = data.first_name
    if data.last_name:
        update_data["last_name"] = data.last_name
    if data.phone_number:
        update_data["phone_number"] = data.phone_number
    if data.profile_pic:
        update_data["profile_pic"] = data.profile_pic
    if data.password:
        update_data["hashed_password"] = hash_password(data.password)

    if update_data:
        await users_collection.update_one({"email": email}, {"$set": update_data})

    updated_user = await users_collection.find_one({"email": email})
    return UserProfile(**updated_user)
