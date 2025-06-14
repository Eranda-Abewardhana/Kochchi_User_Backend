#!/usr/bin/env python3
"""
Super Admin Initialization Script
Run this script once to create the initial super admin user
"""

import asyncio
import sys
import os
from datetime import datetime

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from databases.mongo import db
from utils.auth.jwt_functions import hash_password


async def init_super_admin():
    """Initialize super admin user - run this once"""
    try:
        users_collection = db["users"]

        # Check if super admin already exists
        existing_super_admin = await users_collection.find_one({"role": "super_admin"})
        if existing_super_admin:
            print("✅ Super admin already exists!")
            print(f"Username: {existing_super_admin.get('username', 'N/A')}")
            return

        # Create super admin
        super_admin_data = {
            "username": "superadmin",
            "email": "superadmin@company.com",
            "first_name": "Super",
            "last_name": "Admin",
            "phone_number": "",
            "profile_pic": None,
            "hashed_password": hash_password("SuperAdmin123!"),  # Change this password
            "role": "super_admin",
            "created_at": datetime.utcnow(),
            "is_active": True
        }

        await users_collection.insert_one(super_admin_data)
        print("🎉 Super admin created successfully!")
        print("=" * 40)
        print("📋 LOGIN CREDENTIALS:")
        print(f"Username: superadmin")
        print(f"Password: SuperAdmin123!")
        print("=" * 40)
        print("⚠️  IMPORTANT: Please change the password after first login!")

    except Exception as e:
        print(f"❌ Error creating super admin: {e}")
        sys.exit(1)


async def create_indexes():
    """Create database indexes for better performance"""
    try:
        users_collection = db["users"]

        # Create indexes
        await users_collection.create_index("username", unique=True, sparse=True)
        await users_collection.create_index("email", unique=True, sparse=True)
        await users_collection.create_index("role")

        print("📊 Database indexes created successfully!")

    except Exception as e:
        print(f"❌ Error creating indexes: {e}")


async def main():
    print("🚀 Initializing Super Admin...")
    await init_super_admin()
    await create_indexes()
    print("✅ Initialization complete!")


if __name__ == "__main__":
    asyncio.run(main())