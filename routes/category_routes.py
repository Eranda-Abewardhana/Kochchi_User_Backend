from bson.errors import InvalidId
from fastapi import APIRouter, HTTPException, Body
from databases.mongo import db
from data_models.category_model import Category, CategoryResponse, CreateCategoryResponse, ErrorResponse
from bson import ObjectId
from typing import List

category_router = APIRouter(prefix="/api/categories", tags=["Categories"])
category_collection = db["categories"]

# ✅ Create new category
@category_router.post(
    "/create",
    response_model=CreateCategoryResponse,
    responses={400: {"model": ErrorResponse}}
)
async def create_category(data: Category):
    existing = await category_collection.find_one({"name": data.name})
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    result = await category_collection.insert_one(data.dict())
    return {
        "message": "Category created successfully",
        "category_id": str(result.inserted_id)
    }

# ✅ Get all categories
@category_router.get("/", response_model=List[CategoryResponse])
async def get_all_categories():
    categories = []
    async for cat in category_collection.find():
        cat["id"] = str(cat["_id"])
        categories.append(CategoryResponse(**cat))
    return categories

# ✅ Get category by ID
@category_router.get("/{category_id}", response_model=CategoryResponse)
async def get_category_by_id(category_id: str):
    cat = await category_collection.find_one({"_id": ObjectId(category_id)})
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    cat["id"] = str(cat["_id"])
    return CategoryResponse(**cat)

# ✅ Delete category
@category_router.delete("/{category_id}", response_model=CreateCategoryResponse)
async def delete_category(category_id: str):
    result = await category_collection.delete_one({"_id": ObjectId(category_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted", "category_id": category_id}


@category_router.put("/{category_id}", response_model=CreateCategoryResponse)
async def update_category(category_id: str, data: Category = Body(...)):
    try:
        obj_id = ObjectId(category_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid category ID")

    update_data = {k: v for k, v in data.dict().items() if v is not None}
    result = await category_collection.update_one(
        {"_id": obj_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")

    return {
        "message": "Category updated successfully",
        "category_id": category_id
    }
