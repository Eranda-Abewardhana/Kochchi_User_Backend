# services/email_templates.py

def get_verification_email_template(first_name: str, verification_link: str) -> str:
    """Get HTML template for email verification"""
    return f"""
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Welcome to Our Platform!</h1>
                </div>

                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <h2 style="color: #333; margin-top: 0; font-size: 24px;">Hi {first_name}! 👋</h2>
                    <p style="font-size: 16px; margin-bottom: 25px;">Thank you for joining us! We're excited to have you on board.</p>
                    <p style="font-size: 16px; margin-bottom: 30px;">To get started and secure your account, please verify your email address by clicking the button below:</p>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="{verification_link}" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; 
                                  padding: 16px 32px; 
                                  text-decoration: none; 
                                  border-radius: 25px; 
                                  display: inline-block; 
                                  font-weight: 600; 
                                  font-size: 16px;
                                  transition: transform 0.2s;">
                            ✨ Verify Email Address
                        </a>
                    </div>

                    <!-- Alternative Link -->
                    <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #667eea;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Can't click the button? Copy and paste this link:</p>
                        <p style="word-break: break-all; font-family: monospace; font-size: 12px; color: #333; margin: 0;">
                            {verification_link}
                        </p>
                    </div>

                    <!-- Expiry Notice -->
                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 25px 0;">
                        <p style="margin: 0; font-size: 14px; color: #856404;">
                            ⏰ <strong>Important:</strong> This verification link will expire in 24 hours for security reasons.
                        </p>
                    </div>

                    <p style="font-size: 14px; color: #666; margin-top: 30px;">
                        If you didn't create an account with us, you can safely ignore this email.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                    <p style="margin: 0; font-size: 12px; color: #6c757d;">
                        This is an automated message, please do not reply to this email.
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #6c757d;">
                        © 2025 Your Company Name. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
    </html>
    """


def get_welcome_email_template(first_name: str, frontend_url: str) -> str:
    """Get HTML template for welcome email"""
    return f"""
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome!</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">🎉 You're All Set!</h1>
                </div>

                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <h2 style="color: #333; margin-top: 0; font-size: 24px;">Welcome, {first_name}!</h2>
                    <p style="font-size: 16px; margin-bottom: 25px;">Your email has been successfully verified! You can now access all features of your account.</p>

                    <div style="text-align: center; margin: 40px 0;">
                        <a href="{frontend_url}/login" 
                           style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
                                  color: white; 
                                  padding: 16px 32px; 
                                  text-decoration: none; 
                                  border-radius: 25px; 
                                  display: inline-block; 
                                  font-weight: 600; 
                                  font-size: 16px;">
                            🚀 Start Exploring
                        </a>
                    </div>

                    <p style="font-size: 14px; color: #666; text-align: center;">
                        Ready to get started? Log in to your account and explore!
                    </p>
                </div>
            </div>
        </body>
    </html>
    """