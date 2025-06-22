# services/email_service.py
import resend
import os
from fastapi import HTTPException
from typing import Dict, Any

from utils.email.email_template import get_verification_email_template, get_welcome_email_template, get_password_reset_email_template


class EmailService:
    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY")
        self.from_email = os.getenv("FROM_EMAIL", "Acme <onboarding@resend.dev>")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        self.test_email = os.getenv("TEST_EMAIL", "kavishkanimsara.official@gmail.com")

        if not self.api_key:
            raise ValueError("RESEND_API_KEY environment variable is required")

        # Set the API key for resend
        resend.api_key = self.api_key

    async def _send_email(self, to_email: str, subject: str, html_content: str, reply_to_email: str = None) -> Dict[
        str, Any]:
        """Send email using Resend SDK"""
        try:
            params: resend.Emails.SendParams = {
                "from": self.from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }

            email: resend.Email = resend.Emails.send(params)
            return email

        except Exception as e:
            print(f"Failed to send email: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to send email: {str(e)}"
            )

    async def send_verification_email(self, email: str, token: str, first_name: str):
        """Send email verification"""
        verification_link = f"{self.frontend_url}/verify-email?token={token}"
        html_content = get_verification_email_template(first_name, verification_link)

        result = await self._send_email(
            to_email=email,  # Send directly to the user
            subject=f"🎉 Verify Your Email Address - Welcome Aboard!",
            html_content=html_content
        )
        print(f"Verification email sent to {email}")
        return result

    async def send_welcome_email(self, email: str, first_name: str):
        """Send welcome email after verification"""
        try:
            html_content = get_welcome_email_template(first_name, self.frontend_url)

            result = await self._send_email(
                to_email=email,  # Send directly to the user
                subject=f"🎉 Welcome! Your account is ready",
                html_content=html_content
            )
            print(f"Welcome email sent to {email}")
            return result
        except Exception as e:
            # Log error but don't fail the verification process
            print(f"Failed to send welcome email: {e}")
            pass

    async def send_password_reset_email(self, email: str, token: str, first_name: str):
        """Send password reset email"""
        reset_link = f"{self.frontend_url}/reset-password?token={token}"
        html_content = get_password_reset_email_template(first_name, reset_link)

        result = await self._send_email(
            to_email=email,  # Send directly to the user
            subject=f"🔐 Password Reset Request",
            html_content=html_content
        )
        print(f"Password reset email sent to {email}")
        return result


# Singleton instance
email_service = EmailService()