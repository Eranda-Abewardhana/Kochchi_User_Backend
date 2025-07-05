import os
import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
from passlib.context import CryptContext
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from databases.mongo import db

# Load environment variables
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "3f2b1f41c9a042c69a7e826ee3f4e379d6a52b6818f942d0b9ac746688e423f4")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

users_collection = db["users"]


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, user_id: str):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Ensure the user_id is stored in UUID format in the token
    to_encode.update({
        "exp": expire,
        "user_id": str(user_id)  # Convert to UUID format string
    })

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# Alias for backward compatibility
def decode_token(token: str):
    """Alias for verify_token - kept for backward compatibility"""
    return verify_token(token)


from bson import ObjectId

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    identifier = payload.get("sub")

    if not identifier:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Lookup by username or email
    user = await users_collection.find_one({
        "$or": [
            {"username": identifier},
            {"email": identifier}
        ]
    })

    if not user or not user.get("is_active", True):
        raise HTTPException(status_code=401, detail="User not found or inactive")

    # Attach user_id as a string
    user["user_id"] = str(user["_id"])

    return user



async def get_super_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin access required")
    return current_user


async def get_admin_or_super(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user