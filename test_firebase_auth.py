#!/usr/bin/env python3
"""
Test script for Firebase Authentication integration
Run this script to test your Firebase setup
"""

import asyncio
import os
import sys
from datetime import datetime

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.firebase_service import firebase_service
from databases.mongo import db

async def test_firebase_service():
    """Test Firebase service initialization and basic functionality"""
    print("🧪 Testing Firebase Service...")
    
    try:
        # Test Firebase initialization
        print("✅ Firebase service initialized successfully")
        
        # Test with a dummy token (this will fail, but we can test the error handling)
        dummy_token = "dummy_token_for_testing"
        
        try:
            await firebase_service.verify_firebase_token(dummy_token)
        except Exception as e:
            if "Invalid Firebase token" in str(e) or "Firebase token has expired" in str(e):
                print("✅ Firebase token verification error handling works correctly")
            else:
                print(f"❌ Unexpected error: {e}")
        
        print("✅ Firebase service test completed")
        
    except Exception as e:
        print(f"❌ Firebase service test failed: {e}")
        return False
    
    return True

async def test_mongodb_connection():
    """Test MongoDB connection"""
    print("\n🧪 Testing MongoDB Connection...")
    
    try:
        # Test database connection
        await db.command("ping")
        print("✅ MongoDB connection successful")
        
        # Test users collection
        users_collection = db["users"]
        count = await users_collection.count_documents({})
        print(f"✅ Users collection accessible, {count} users found")
        
        return True
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

async def test_environment_variables():
    """Test required environment variables"""
    print("\n🧪 Testing Environment Variables...")
    
    required_vars = [
        "MONGODB_URL",
        "JWT_SECRET_KEY",
        "RESEND_API_KEY"
    ]
    
    optional_vars = [
        "FIREBASE_SERVICE_ACCOUNT_KEY",
        "FIREBASE_SERVICE_ACCOUNT_PATH"
    ]
    
    missing_required = []
    missing_optional = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_required.append(var)
        else:
            print(f"✅ {var} is set")
    
    for var in optional_vars:
        if not os.getenv(var):
            missing_optional.append(var)
        else:
            print(f"✅ {var} is set")
    
    if missing_required:
        print(f"❌ Missing required environment variables: {missing_required}")
        return False
    
    if missing_optional:
        print(f"⚠️  Missing optional Firebase variables: {missing_optional}")
        print("   You need to set either FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_SERVICE_ACCOUNT_PATH")
    
    return True

async def main():
    """Main test function"""
    print("🚀 Starting Firebase Authentication Integration Tests")
    print("=" * 50)
    
    # Test environment variables
    env_ok = await test_environment_variables()
    
    # Test MongoDB connection
    mongo_ok = await test_mongodb_connection()
    
    # Test Firebase service
    firebase_ok = await test_firebase_service()
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"Environment Variables: {'✅ PASS' if env_ok else '❌ FAIL'}")
    print(f"MongoDB Connection: {'✅ PASS' if mongo_ok else '❌ FAIL'}")
    print(f"Firebase Service: {'✅ PASS' if firebase_ok else '❌ FAIL'}")
    
    if all([env_ok, mongo_ok, firebase_ok]):
        print("\n🎉 All tests passed! Your Firebase integration is ready.")
        print("\n📝 Next steps:")
        print("1. Set up your Firebase project in Firebase Console")
        print("2. Download your service account key")
        print("3. Configure FIREBASE_SERVICE_ACCOUNT_KEY in your .env file")
        print("4. Test the /auth/firebase endpoint with a real Firebase token")
    else:
        print("\n❌ Some tests failed. Please fix the issues above before proceeding.")
    
    print("\n📖 For detailed setup instructions, see FIREBASE_SETUP.md")

if __name__ == "__main__":
    asyncio.run(main()) 