import asyncio
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
import uvicorn
from databases.mongo import ensure_collections_exist
from routes.ads_routes import ads_router
from routes.auth_routes import auth_router
from routes.blog_routes import blog_router
from routes.category_routes import category_router
from routes.competition_routes import competition_router
from routes.dansal_routes import dansal_router
from routes.payment__routes import payment_router
from routes.popup_routes import popup_router
from routes.pricing_routes import pricing_router
from routes.user_router import user_router
from services.remove_expired_records import remove_old_non_top_non_carousal_ads, remove_expired_dansals
from utils.auth.jwt_functions import hash_password
from datetime import datetime
from databases.mongo import db

# Load environment variables
load_dotenv()

app = FastAPI()

BASE_URL = os.getenv("BASE_URL", "http://localhost")
PORT = int(os.getenv("PORT", 8000))

async def init_super_admin():
    """Initialize super admin user if not exists"""
    try:
        users_collection = db["users"]

        # Check if super admin already exists
        existing_super_admin = await users_collection.find_one({"role": "super_admin"})
        if existing_super_admin:
            print("✅ Super admin already exists!")
            print(f"Username: {existing_super_admin.get('username', 'N/A')}")
            return

        # Get super admin credentials from environment variables
        super_admin_username = os.getenv("SUPER_ADMIN_USERNAME", "superadmin")
        super_admin_password = os.getenv("SUPER_ADMIN_PASSWORD", "SuperAdmin123!")
        super_admin_email = os.getenv("SUPER_ADMIN_EMAIL", "superadmin@company.com")
        super_admin_first_name = os.getenv("SUPER_ADMIN_FIRST_NAME", "Super")
        super_admin_last_name = os.getenv("SUPER_ADMIN_LAST_NAME", "Admin")

        # Create super admin
        super_admin_data = {
            "username": super_admin_username,
            "email": super_admin_email,
            "first_name": super_admin_first_name,
            "last_name": super_admin_last_name,
            "phone_number": "",
            "profile_pic": None,
            "hashed_password": hash_password(super_admin_password),
            "role": "super_admin",
            "created_at": datetime.utcnow(),
            "is_active": True
        }

        await users_collection.insert_one(super_admin_data)
        print("🎉 Super admin created successfully!")
        print("=" * 40)
        print("📋 LOGIN CREDENTIALS:")
        print(f"Username: {super_admin_username}")
        print(f"Password: {super_admin_password}")
        print("=" * 40)
        print("⚠️  IMPORTANT: Please change the password after first login!")

    except Exception as e:
        print(f"❌ Error creating super admin: {e}")

async def create_database_indexes():
    """Create database indexes for better performance"""
    try:
        from databases.mongo import db
        users_collection = db["users"]

        # Create indexes
        await users_collection.create_index("username", unique=True, sparse=True)
        await users_collection.create_index("email", unique=True, sparse=True)
        await users_collection.create_index("role")

        print("📊 Database indexes created successfully!")

    except Exception as e:
        print(f"❌ Error creating indexes: {e}")

@app.on_event("startup")
async def startup_event():
    async def check_database():
        await ensure_collections_exist()
        await init_super_admin()
        await create_database_indexes()
        
    async def periodic_ad_cleanup():
        while True:
            await remove_old_non_top_non_carousal_ads()
            await asyncio.sleep(86400)  # every 24 hours

    async def periodic_dansal_cleanup():
        while True:
            await remove_expired_dansals()
            await asyncio.sleep(21600)  # every 6 hours

    asyncio.create_task(periodic_ad_cleanup())
    asyncio.create_task(periodic_dansal_cleanup())
    asyncio.create_task(check_database())

origins = [
    "*",  # Deployed frontend
]

app.add_middleware(
    CORSMiddleware,       # Allow specific origins
    allow_credentials=True,
    allow_origins=["*"],
    # Allow cookies to be sent
    allow_methods=["*"],          # Allow all HTTP methods
    allow_headers=["*"],
    # Allow all headers
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(ads_router)

app.include_router(competition_router)
app.include_router(blog_router)
app.include_router(payment_router)

app.include_router(dansal_router)
app.include_router(pricing_router)
app.include_router(category_router)
app.include_router(popup_router)

os.makedirs('data_sources', exist_ok=True)
app.mount("/data_sources", StaticFiles(directory="data_sources"), name="data_sources")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)



