import json
import os
from typing import List
from fastapi import APIRouter, HTTPException, status, UploadFile, Form, File, Depends
from data_models.blog_model import BlogPost, UpdateBlogRequest
from databases.mongo import db
from bson import ObjectId
from datetime import datetime

from services.file_upload_service import save_uploaded_images
from utils.auth.jwt_functions import get_admin_or_super

blog_router = APIRouter(prefix="/blog", tags=["Blog"])
blog_collection = db["blogs"]
# Base path for storing blog images
BASE_IMAGE_PATH = "data_sources"
# --- Create a new blog post ---
@blog_router.post("/", response_model=BlogPost, status_code=status.HTTP_201_CREATED)
async def create_blog(
        title: str = Form(...),
        content: str = Form(...),
        images: List[UploadFile] = File(None),  # Optional images
        current_user: dict = Depends(get_admin_or_super)
):
    try:
        # Prepare blog data
        post_data = {
            "title": title,
            "content": content,
            "createdAt": datetime.utcnow(),
            "img_url": None  # Initialize as None
        }

        # Insert blog post first to get the ID
        result = await blog_collection.insert_one(post_data)
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to create blog post")

        blog_id = str(result.inserted_id)

        # Handle image upload if images are provided
        if images and len(images) > 0:
            # Upload watermarked images to Cloudinary under folder 'dansals/{dansal_id}'
            image_urls = save_uploaded_images(
                images,
                cloud_folder=f"blogs/{blog_id}"
            )
            # Store only the first image URL in imgUrl field
            first_image_url = image_urls[0] if image_urls else None

            # Update the blog post with the first image URL
            await blog_collection.update_one(
                {"_id": result.inserted_id},
                {"$set": {"img_url": first_image_url}}
            )

            post_data["img_url"] = first_image_url

        # Return the created blog post
        post_data["id"] = blog_id
        return BlogPost(**post_data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# --- Get all blog posts ---
@blog_router.get("/", response_model=list[BlogPost])
async def get_all_blogs():
    blogs = []
    async for post in blog_collection.find().sort("createdAt", -1):
        post["id"] = str(post["_id"])
        del post["_id"]
        blogs.append(BlogPost(**post))
    return blogs


# --- Get blog post by ID ---
@blog_router.get("/{blog_id}", response_model=BlogPost)
async def get_blog_by_id(blog_id: str):
    try:
        blog = await blog_collection.find_one({"_id": ObjectId(blog_id)})
        if blog:
            blog["id"] = str(blog["_id"])
            del blog["_id"]
            return BlogPost(**blog)
        raise HTTPException(status_code=404, detail="Blog post not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid blog ID format")


# --- Update blog post by ID ---
@blog_router.put("/{blog_id}", response_model=BlogPost)
async def update_blog(
        blog_id: str, 
        updated_data: UpdateBlogRequest,
        current_user: dict = Depends(get_admin_or_super)
):
    try:
        update_fields = updated_data.dict(exclude_unset=True)
        if "img_url" in update_fields:
            update_fields["img_url"] = str(update_fields["img_url"])

        result = await blog_collection.find_one_and_update(
            {"_id": ObjectId(blog_id)},
            {"$set": update_fields},
            return_document=True
        )

        if result:
            result["id"] = str(result["_id"])
            del result["_id"]
            return BlogPost(**result)
        raise HTTPException(status_code=404, detail="Blog post not found")

    except Exception:
        raise HTTPException(status_code=400, detail="Invalid blog ID or update failed")


# --- Delete blog post by ID ---
@blog_router.delete("/{blog_id}", status_code=204)
async def delete_blog(
        blog_id: str,
        current_user: dict = Depends(get_admin_or_super)
):
    try:
        result = await blog_collection.delete_one({"_id": ObjectId(blog_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Blog post not found")
        return
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid blog ID format")
