# services/email_service.py
import httpx
import os
from dotenv import load_dotenv
from fastapi import HTTPException
from utils.email.email_template import get_verification_email_template, get_welcome_email_template

# Load environment variables
#load_dotenv()

class EmailService:
    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY")
        self.from_email = os.getenv("FROM_EMAIL", "onboarding@yourdomain.com")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

        if not self.api_key:
            raise ValueError("RESEND_API_KEY environment variable is required")

    async def _send_email(self, to_email: str, subject: str, html_content: str):
        """Send email using Resend API"""
        payload = {
            "from": self.from_email,
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "https://api.resend.com/emails",
                    json=payload,
                    headers=headers,
                    timeout=30.0
                )

                if response.status_code != 200:
                    error_detail = response.json().get("message", "Unknown error")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to send email: {error_detail}"
                    )

                return response.json()

            except httpx.TimeoutException:
                raise HTTPException(
                    status_code=500,
                    detail="Email service timeout. Please try again."
                )
            except httpx.RequestError:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to connect to email service"
                )

    async def send_verification_email(self, email: str, token: str, first_name: str):
        """Send email verification"""
        verification_link = f"{self.frontend_url}/verify-email?token={token}"
        html_content = get_verification_email_template(first_name, verification_link)

        await self._send_email(
            email,
            "🎉 Verify Your Email Address - Welcome Aboard!",
            html_content
        )

    async def send_welcome_email(self, email: str, first_name: str):
        """Send welcome email after verification"""
        try:
            html_content = get_welcome_email_template(first_name, self.frontend_url)
            await self._send_email(
                email,
                "🎉 Welcome! Your account is ready",
                html_content
            )
        except Exception as e:
            # Log error but don't fail the verification process
            print(f"Failed to send welcome email: {e}")
            pass


# Singleton instance
email_service = EmailService()