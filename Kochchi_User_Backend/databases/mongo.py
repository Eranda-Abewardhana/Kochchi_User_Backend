import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import CollectionInvalid
from dotenv import load_dotenv
load_dotenv()
# Read environment variables directly (these are injected by Docker Compose or Deployment)
MONGODB_URI = os.getenv("MONGODB_URI")
REQUIRED_COLLECTIONS = os.environ.get("REQUIRED_COLLECTIONS", "").split(",")
REQUIRED_COLLECTIONS = [col.strip() for col in REQUIRED_COLLECTIONS if col.strip()]

# Create Mongo client
client = AsyncIOMotorClient(MONGODB_URI)
db = client.get_default_database("kochchi_app")

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
