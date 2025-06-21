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
                "reply_to": reply_to_email,
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

        # For testing: add note about actual recipient
        actual_recipient = email
        if email != self.test_email:
            html_content = f"""
            <div style="background: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px; font-family: Arial, sans-serif;">
                <strong>🧪 Testing Mode:</strong> This email was intended for: <strong>{actual_recipient}</strong>
                <br><small>Replies to this email will go to the actual user.</small>
            </div>
            {html_content}
            """

        result = await self._send_email(
            to_email=self.test_email,  # Send to your test email
            subject=f"🎉 Verify Your Email Address - Welcome Aboard!" + (
                f" (Test for {actual_recipient})" if email != self.test_email else ""),
            html_content=html_content,
            reply_to_email=actual_recipient  # Replies go to the signed-up user
        )
        print(f"Verification email sent to {self.test_email}, reply-to: {actual_recipient}")
        return result

    async def send_welcome_email(self, email: str, first_name: str):
        """Send welcome email after verification"""
        try:
            html_content = get_welcome_email_template(first_name, self.frontend_url)

            # For testing: add note about actual recipient
            actual_recipient = email
            if email != self.test_email:
                html_content = f"""
                <div style="background: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px; font-family: Arial, sans-serif;">
                    <strong>🧪 Testing Mode:</strong> This email was intended for: <strong>{actual_recipient}</strong>
                    <br><small>Replies to this email will go to the actual user.</small>
                </div>
                {html_content}
                """

            result = await self._send_email(
                to_email=self.test_email,  # Send to your test email
                subject=f"🎉 Welcome! Your account is ready" + (
                    f" (Test for {actual_recipient})" if email != self.test_email else ""),
                html_content=html_content,
                reply_to_email=actual_recipient  # Replies go to the signed-up user
            )
            print(f"Welcome email sent to {self.test_email}, reply-to: {actual_recipient}")
            return result
        except Exception as e:
            # Log error but don't fail the verification process
            print(f"Failed to send welcome email: {e}")
            pass

    async def send_password_reset_email(self, email: str, token: str, first_name: str):
        """Send password reset email"""
        reset_link = f"{self.frontend_url}/reset-password?token={token}"
        html_content = get_password_reset_email_template(first_name, reset_link)

        # For testing: add note about actual recipient
        actual_recipient = email
        if email != self.test_email:
            html_content = f"""
            <div style="background: #f0f0f0; padding: 10px; margin-bottom: 20px; border-radius: 5px; font-family: Arial, sans-serif;">
                <strong>🧪 Testing Mode:</strong> This email was intended for: <strong>{actual_recipient}</strong>
                <br><small>Replies to this email will go to the actual user.</small>
            </div>
            {html_content}
            """

        result = await self._send_email(
            to_email=self.test_email,  # Send to your test email
            subject=f"🔐 Password Reset Request" + (
                f" (Test for {actual_recipient})" if email != self.test_email else ""),
            html_content=html_content,
            reply_to_email=actual_recipient  # Replies go to the actual user
        )
        print(f"Password reset email sent to {self.test_email}, reply-to: {actual_recipient}")
        return result


# Singleton instance
email_service = EmailService()