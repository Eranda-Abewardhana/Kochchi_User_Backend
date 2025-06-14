from pydantic import BaseModel, EmailStr
from typing import Optional

# --- User Profile Response Model ---

class UserProfile(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    profile_pic: Optional[str]


# --- User Profile Update Model ---

class UpdateProfileRequest(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    phone_number: Optional[str]
    profile_pic: Optional[str]
