import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Get URI from .env
MONGODB_URI = os.getenv("MONGODB_URI")

# Create MongoDB client
client = AsyncIOMotorClient(MONGODB_URI)

# Access a specific database (e.g., "mydb")
db = client.get_default_database("kochchi_app")  # or client["mydb"] if not specified in URI
