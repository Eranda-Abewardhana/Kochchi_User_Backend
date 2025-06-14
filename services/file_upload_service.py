import os
import shutil
from typing import List
from dotenv import load_dotenv
from fastapi import UploadFile

# Load environment variables from .env
load_dotenv()

# Get BASE_URL and PORT from env (default fallback)
BASE_URL = os.getenv("BASE_URL", "http://localhost")
PORT = os.getenv("PORT")

# Construct full base URL with port (if not already included)
if PORT and f":{PORT}" not in BASE_URL:
    BASE_URL = f"{BASE_URL.rstrip('/')}:{PORT}"

def save_uploaded_images(images: List[UploadFile], target_folder: str) -> List[str]:
    os.makedirs(target_folder, exist_ok=True)
    image_urls = []

    for image in images:
        file_path = os.path.join(target_folder, image.filename)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(image.file, f)

        relative_path = f"/{target_folder.replace(os.sep, '/')}/{image.filename}"
        full_url = f"{BASE_URL.rstrip('/')}{relative_path}"
        image_urls.append(full_url)

    return image_urls
