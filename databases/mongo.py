import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pymongo.errors import CollectionInvalid

# Load environment variables
#load_dotenv()

# Mongo URI
MONGODB_URI = os.getenv("MONGODB_URI")

# Mongo client and database
client = AsyncIOMotorClient(MONGODB_URI)
db = client.get_default_database("kochchi_app")

# ✅ Load required collections from .env
REQUIRED_COLLECTIONS = os.getenv("REQUIRED_COLLECTIONS", "").split(",")

# ✅ Remove whitespace (if any)
REQUIRED_COLLECTIONS = [col.strip() for col in REQUIRED_COLLECTIONS if col.strip()]

# ✅ Ensure collections exist
async def ensure_collections_exist():
    existing_collections = await db.list_collection_names()
    for name in REQUIRED_COLLECTIONS:
        if name not in existing_collections:
            try:
                await db.create_collection(name)
                print(f"✅ Created missing collection: {name}")
            except CollectionInvalid:
                print(f"⚠️ Failed to create collection: {name}")
        else:
            print(f"✅ Collection exists: {name}")
