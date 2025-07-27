import os
import uuid
import io  # FIX: import correctly
from typing import List
from fastapi import UploadFile
from PIL import Image, ImageDraw, ImageFont
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
load_dotenv()
# --- Load environment variables ---
BASE_URL = os.getenv("BASE_URL", "http://localhost")
PORT = os.getenv("PORT")

cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("CLOUD_API_KEY"),
    api_secret=os.getenv("CLOUD_API_SECRET")
)

if PORT and f":{PORT}" not in BASE_URL:
    BASE_URL = f"{BASE_URL.rstrip('/')}:{PORT}"

# --- Watermark in memory ---
def add_watermark(image: Image.Image, text: str = "kochchibazaar") -> io.BytesIO:
    """
    Adds a transparent watermark to the center of the PIL image.
    Returns watermarked image as BytesIO.
    """
    base = image.convert("RGBA")
    W, H = base.size
    try:
        font = ImageFont.truetype("arialbd.ttf", int(W * 0.20))
    except:
        font = ImageFont.load_default()

    txt_layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(txt_layer)
    bbox = draw.textbbox((0, 0), text, font=font)
    x = (W - (bbox[2] - bbox[0])) // 2
    y = (H - (bbox[3] - bbox[1])) // 2
    draw.text((x, y), text, font=font, fill=(255, 255, 255, 100))

    watermarked = Image.alpha_composite(base, txt_layer).convert("RGB")
    output = io.BytesIO()
    watermarked.save(output, format="JPEG")
    output.seek(0)
    return output

# --- Upload directly to Cloudinary ---
def save_uploaded_images(images: List[UploadFile], cloud_folder: str = "uploads") -> List[str]:
    image_urls = []

    for image in images:
        try:
            image_data = image.file.read()
            pil_image = Image.open(io.BytesIO(image_data))
            watermarked_io = add_watermark(pil_image)

            response = cloudinary.uploader.upload(
                watermarked_io,
                folder=cloud_folder,
                use_filename=True,
                unique_filename=False,
                public_id=image.filename or str(uuid.uuid4())
            )
            image_urls.append(response["secure_url"])
        except Exception as e:
            print(f"Error processing file '{image.filename}': {e}")
            continue

    return image_urls

# --- Optional: Upload by image path ---
def upload_image_to_cloudinary(image_path: str, folder: str = "uploads") -> str:
    try:
        response = cloudinary.uploader.upload(
            image_path,
            folder=folder,
            use_filename=True,
            unique_filename=False
        )
        print("Upload successful.")
        return response["secure_url"]
    except Exception as e:
        print("Upload failed:", e)
        return None
