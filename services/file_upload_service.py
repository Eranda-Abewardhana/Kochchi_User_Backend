import os
import shutil
import uuid
from typing import List
from fastapi import UploadFile
#from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from PIL import Image, ImageDraw, ImageFont

# Load environment variables from .env
#load_dotenv()

BASE_URL = os.getenv("BASE_URL", "http://localhost")
PORT = os.getenv("PORT")

if PORT and f":{PORT}" not in BASE_URL:
    BASE_URL = f"{BASE_URL.rstrip('/')}:{PORT}"

def add_watermark(img_path: str, text: str = "kochchibazaar") -> str:
    try:
        with Image.open(img_path).convert("RGBA") as base:
            W, H = base.size
            try:
                font = ImageFont.truetype("arialbd.ttf", int(W * 0.11))
            except:
                font = ImageFont.load_default()

            txt = Image.new("RGBA", base.size, (0, 0, 0, 0))
            d = ImageDraw.Draw(txt)
            bbox = d.textbbox((0, 0), text, font=font)
            x, y = (W - (bbox[2] - bbox[0])) // 2, (H - (bbox[3] - bbox[1])) // 2
            d.text((x, y), text, font=font, fill=(255, 255, 255, 100))

            watermarked = Image.alpha_composite(base, txt).convert("RGB")

            name, ext = os.path.splitext(img_path)
            watermarked_path = f"{name}_watermarked{ext}"
            watermarked.save(watermarked_path)

            return watermarked_path
    except Exception as e:
        print(f"Watermarking failed for {img_path}: {e}")
        return img_path  # fallback to original image path

def save_uploaded_images(images: List[UploadFile], target_folder: str) -> List[str]:
    os.makedirs(target_folder, exist_ok=True)
    image_urls = []

    for image in images:
        original_filename = image.filename.strip()
        filename = secure_filename(original_filename) if original_filename else f"{uuid.uuid4().hex}.jpg"
        file_path = os.path.join(target_folder, filename)

        try:
            with open(file_path, "wb") as f:
                shutil.copyfileobj(image.file, f)

            # Add watermark and get new path
            watermarked_path = add_watermark(file_path)

            # Build public URL
            relative_path = f"/{os.path.relpath(watermarked_path).replace(os.sep, '/')}"
            full_url = f"{BASE_URL.rstrip('/')}{relative_path}"
            image_urls.append(full_url)

        except Exception as e:
            print(f"Error saving or watermarking file '{filename}': {e}")
            continue

    return image_urls
