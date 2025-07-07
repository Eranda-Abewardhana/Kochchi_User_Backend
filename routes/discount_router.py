from fastapi import APIRouter, HTTPException, Body, Depends
from bson import ObjectId
from bson.errors import InvalidId
from typing import List
from datetime import datetime

from databases.mongo import db
from utils.auth.jwt_functions import get_current_user
from data_models.discount_model import Discount, DiscountResponse, CreateDiscountResponse, ErrorResponse

discount_router = APIRouter(prefix="/discounts", tags=["Discounts"])
discount_collection = db["discounts"]


# ✅ Create new discount
@discount_router.post(
    "/create",
    response_model=CreateDiscountResponse,
    responses={400: {"model": ErrorResponse}}
)
async def create_discount(data: Discount, current_user: dict = Depends(get_current_user)):
    data_dict = data.dict()
    data_dict["createdAt"] = datetime.utcnow()
    data_dict["updatedAt"] = datetime.utcnow()

    result = await discount_collection.insert_one(data_dict)
    return {
        "message": "Discount created successfully",
        "discount_id": str(result.inserted_id)
    }


# ✅ Get all discounts
@discount_router.get("/", response_model=List[DiscountResponse])
async def get_all_discounts():
    discounts = []
    async for disc in discount_collection.find():
        disc["id"] = str(disc["_id"])
        discounts.append(DiscountResponse(**disc))
    return discounts


# ✅ Get discount by ID
@discount_router.get("/{discount_id}", response_model=DiscountResponse)
async def get_discount_by_id(discount_id: str):
    try:
        obj_id = ObjectId(discount_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid discount ID")

    disc = await discount_collection.find_one({"_id": obj_id})
    if not disc:
        raise HTTPException(status_code=404, detail="Discount not found")

    disc["id"] = str(disc["_id"])
    return DiscountResponse(**disc)


# ✅ Update discount
@discount_router.put("/{discount_id}", response_model=CreateDiscountResponse)
async def update_discount(discount_id: str, data: Discount = Body(...)):
    try:
        obj_id = ObjectId(discount_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid discount ID")

    update_data = {k: v for k, v in data.dict().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()

    result = await discount_collection.update_one(
        {"_id": obj_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Discount not found")

    return {
        "message": "Discount updated successfully",
        "discount_id": discount_id
    }


# ✅ Delete discount
@discount_router.delete("/{discount_id}", response_model=CreateDiscountResponse)
async def delete_discount(discount_id: str):
    try:
        obj_id = ObjectId(discount_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid discount ID")

    result = await discount_collection.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Discount not found")

    return {"message": "Discount deleted", "discount_id": discount_id}
