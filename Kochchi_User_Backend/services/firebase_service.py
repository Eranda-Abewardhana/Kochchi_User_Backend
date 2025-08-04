import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, status
from typing import Optional, Dict, Any
import jwt
import json

class FirebaseService:
    def __init__(self):
        self._initialized = False
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        if self._initialized:
            return
            
        try:
            # Check if Firebase is already initialized
            if not firebase_admin._apps:
                # Get Firebase service account key from environment
                firebase_credentials = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
                
                if firebase_credentials:
                    # Parse the JSON string from environment variable
                    import json
                    cred_dict = json.loads(firebase_credentials)
                    cred = credentials.Certificate(cred_dict)
                else:
                    # Fallback to service account file
                    service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "firebase-service-account.json")
                    if os.path.exists(service_account_path):
                        cred = credentials.Certificate(service_account_path)
                    else:
                        raise ValueError("Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT_KEY or provide firebase-service-account.json")
                
                firebase_admin.initialize_app(cred)
            
            self._initialized = True
        except Exception as e:
            raise Exception(f"Failed to initialize Firebase: {str(e)}")
    
    def _decode_firebase_token(self, id_token: str) -> Dict[str, Any]:
        """
        Decode Firebase ID token without verification
        """
        try:
            # Decode the JWT token without verification
            decoded_token = jwt.decode(id_token, options={"verify_signature": False})
            return decoded_token
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Failed to decode Firebase token: {str(e)}"
            )
    
    async def verify_firebase_token(self, id_token: str) -> Dict[str, Any]:
        """
        Decode Firebase ID token and return user information (without verification)
        
        Args:
            id_token: Firebase ID token from client
            
        Returns:
            Dict containing user information from Firebase
        """
        try:
            # Decode the token without verification
            decoded_token = self._decode_firebase_token(id_token)
            
            # Extract user information
            user_info = {
                "uid": decoded_token.get("user_id") or decoded_token.get("sub", ""),
                "email": decoded_token.get("email", ""),
                "email_verified": decoded_token.get("email_verified", False),
                "name": decoded_token.get("name", ""),
                "picture": decoded_token.get("picture", ""),
                "phone_number": decoded_token.get("phone_number", ""),
                "provider_id": decoded_token.get("firebase", {}).get("sign_in_provider", ""),
                "created_at": decoded_token.get("auth_time", 0),
                "last_sign_in": decoded_token.get("iat", 0)
            }
            
            return user_info
            
        except HTTPException:
            # Re-raise HTTP exceptions
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Firebase token processing failed: {str(e)}"
            )
    
    async def get_firebase_user_by_uid(self, uid: str) -> Optional[Dict[str, Any]]:
        """
        Get Firebase user information by UID (without verification)
        
        Args:
            uid: Firebase user UID
            
        Returns:
            User information from Firebase or None if not found
        """
        try:
            # Since we're not verifying with Firebase, return basic info
            return {
                "uid": uid,
                "email": "",
                "email_verified": False,
                "display_name": "",
                "photo_url": "",
                "phone_number": "",
                "disabled": False,
                "created_at": 0,
                "last_sign_in": 0
            }
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get Firebase user: {str(e)}"
            )

# Create a singleton instance
firebase_service = FirebaseService() 