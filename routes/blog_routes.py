from fastapi import APIRouter, HTTPException, status

from data_models.blog_model import BlogPost, CreateBlogRequest, UpdateBlogRequest
from databases.mongo import db
from bson import ObjectId
from datetime import datetime

blog_router = APIRouter(prefix="/api/blog", tags=["Blog"])
blog_collection = db["blogs"]

# --- Create a new blog post ---
@blog_router.post("/", response_model=BlogPost, status_code=status.HTTP_201_CREATED)
async def create_blog(post: CreateBlogRequest):
    post_data = post.dict()
    post_data["img_url"] = str(post_data["img_url"]) if post_data.get("img_url") else None
    post_data["createdAt"] = datetime.utcnow()

    result = await blog_collection.insert_one(post_data)
    if result.inserted_id:
        post_data["id"] = str(result.inserted_id)
        return BlogPost(**post_data)
    raise HTTPException(status_code=500, detail="Failed to create blog post")


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
async def update_blog(blog_id: str, updated_data: UpdateBlogRequest):
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
async def delete_blog(blog_id: str):
    try:
        result = await blog_collection.delete_one({"_id": ObjectId(blog_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Blog post not found")
        return
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid blog ID format")
