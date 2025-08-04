import os
import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, status
from typing import Optional, Dict, Any

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
    
    async def verify_firebase_token(self, id_token: str) -> Dict[str, Any]:
        """
        Verify Firebase ID token and return user information
        
        Args:
            id_token: Firebase ID token from client
            
        Returns:
            Dict containing user information from Firebase
        """
        # Initialize Firebase if not already initialized
        self._initialize_firebase()
        
        try:
            # Verify the ID token
            decoded_token = auth.verify_id_token(id_token)
            
            # Extract user information
            user_info = {
                "uid": decoded_token["uid"],
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
            
        except auth.ExpiredIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Firebase token has expired"
            )
        except auth.RevokedIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Firebase token has been revoked"
            )
        except auth.InvalidIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase token"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Firebase verification failed: {str(e)}"
            )
    
    async def get_firebase_user_by_uid(self, uid: str) -> Optional[Dict[str, Any]]:
        """
        Get Firebase user information by UID
        
        Args:
            uid: Firebase user UID
            
        Returns:
            User information from Firebase or None if not found
        """
        # Initialize Firebase if not already initialized
        self._initialize_firebase()
        
        try:
            user_record = auth.get_user(uid)
            return {
                "uid": user_record.uid,
                "email": user_record.email,
                "email_verified": user_record.email_verified,
                "display_name": user_record.display_name,
                "photo_url": user_record.photo_url,
                "phone_number": user_record.phone_number,
                "disabled": user_record.disabled,
                "created_at": user_record.user_metadata.creation_timestamp,
                "last_sign_in": user_record.user_metadata.last_sign_in_timestamp
            }
        except auth.UserNotFoundError:
            return None
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to get Firebase user: {str(e)}"
            )

# Create a singleton instance
firebase_service = FirebaseService() 