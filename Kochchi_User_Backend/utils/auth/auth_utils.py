# utils/auth_utils.py
import secrets
import random
from datetime import datetime, timedelta

def generate_verification_token() -> str:
    """Generate a secure random verification token"""
    return secrets.token_urlsafe(32)

def get_verification_expiry() -> datetime:
    """Get verification token expiry time (24 hours from now)"""
    return datetime.utcnow() + timedelta(hours=24)

def is_token_expired(expires_at: datetime) -> bool:
    """Check if token is expired"""
    return datetime.utcnow() > expires_at

def generate_otp() -> str:
    """Generate a 4-digit OTP code"""
    return str(random.randint(1000, 9999))

def get_otp_expiry() -> datetime:
    """Get OTP expiry time (10 minutes from now)"""
    return datetime.utcnow() + timedelta(minutes=10)

def is_otp_expired(expires_at: datetime) -> bool:
    """Check if OTP is expired"""
    return datetime.utcnow() > expires_at