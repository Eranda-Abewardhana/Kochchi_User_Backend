from datetime import datetime

from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    USER = "user"

# --- Auth Request Models ---

class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    password: str

class LoginRequest(BaseModel):
    username: str  # Can be username or email
    password: str

class GoogleLoginRequest(BaseModel):
    google_id_token: str

class CreateAdminRequest(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    password: str
    profile_pic: Optional[str] = None

class CreateSuperAdminRequest(BaseModel):
    username: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

# --- Password Reset Models ---

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

# --- Auth Response Models ---

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: Optional[str] = None

class UserResponse(BaseModel):
    username: Optional[str]
    email: Optional[str]
    first_name: str
    last_name: str
    phone_number: Optional[str]
    role: str
    is_active: bool
    profile_pic: Optional[str]

class ErrorResponse(BaseModel):
    detail: str


class EmailVerificationRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendVerificationRequest(BaseModel):
    email: EmailStr

class UserLastLoginResponse(BaseModel):
    username: Optional[str]
    email: Optional[EmailStr]
    first_name: str
    last_name: str
    role: str
    last_login: Optional[datetime]