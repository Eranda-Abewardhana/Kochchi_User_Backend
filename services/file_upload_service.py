import os
import shutil
import uuid
from typing import List
from fastapi import UploadFile
from werkzeug.utils import secure_filename
from PIL import Image, ImageDraw, ImageFont

# Environment variables (load directly from docker environment)
BASE_URL = os.getenv("BASE_URL", "http://localhost")
PORT = os.getenv("PORT")

# Build full BASE_URL with port if not already included
if PORT and f":{PORT}" not in BASE_URL:
    BASE_URL = f"{BASE_URL.rstrip('/')}:{PORT}"

def add_watermark(img_path: str, text: str = "kochchibazaar") -> str:
    """
    Adds a transparent watermark text to the center of the image.
    Returns the path of the watermarked image.
    """
    try:
        with Image.open(img_path).convert("RGBA") as base:
            W, H = base.size
            try:
                # Use built-in font if system font is not available
                font = ImageFont.truetype("arialbd.ttf", int(W * 0.11))
            except:
                font = ImageFont.load_default()

            txt_layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
            draw = ImageDraw.Draw(txt_layer)
            bbox = draw.textbbox((0, 0), text, font=font)
            x = (W - (bbox[2] - bbox[0])) // 2
            y = (H - (bbox[3] - bbox[1])) // 2

            draw.text((x, y), text, font=font, fill=(255, 255, 255, 100))
            watermarked = Image.alpha_composite(base, txt_layer).convert("RGB")

            watermarked_path = f"{os.path.splitext(img_path)[0]}_watermarked{os.path.splitext(img_path)[1]}"
            watermarked.save(watermarked_path)

            return watermarked_path

    except Exception as e:
        print(f"Watermarking failed for {img_path}: {e}")
        return img_path  # fallback to original image path

def save_uploaded_images(images: List[UploadFile], target_folder: str) -> List[str]:
    """
    Saves uploaded images to disk with watermark applied, and returns list of public URLs.
    """
    os.makedirs(target_folder, exist_ok=True)
    image_urls = []

    for image in images:
        try:
            original_filename = image.filename.strip() if image.filename else None
            filename = secure_filename(original_filename) if original_filename else f"{uuid.uuid4().hex}.jpg"
            file_path = os.path.join(target_folder, filename)

            # Save uploaded file
            with open(file_path, "wb") as f:
                shutil.copyfileobj(image.file, f)

            # Apply watermark
            watermarked_path = add_watermark(file_path)

            # Generate URL
            relative_path = os.path.relpath(watermarked_path).replace(os.sep, "/")
            full_url = f"{BASE_URL.rstrip('/')}/{relative_path}"
            image_urls.append(full_url)

        except Exception as e:
            print(f"Error processing file '{image.filename}': {e}")
            continue

    return image_urls
