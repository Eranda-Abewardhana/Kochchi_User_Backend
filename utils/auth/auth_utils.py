# utils/auth_utils.py
import secrets
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