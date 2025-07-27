import os
from typing import List
from fastapi import APIRouter, HTTPException, status, Form, Depends
from data_models.notification_model import Notification, UpdateNotificationRequest
from databases.mongo import db
from bson import ObjectId
from datetime import datetime

from utils.auth.jwt_functions import get_admin_or_super

notification_router = APIRouter(prefix="/notifications", tags=["Notifications"])
notification_collection = db["notifications"]

# --- Create a new notification ---
@notification_router.post("/", response_model=Notification, status_code=status.HTTP_201_CREATED)
async def create_notification(
        title: str = Form(...),
        description: str = Form(...),
        current_user: dict = Depends(get_admin_or_super)
):
    try:
        # Prepare notification data
        notification_data = {
            "title": title,
            "description": description,
            "createdAt": datetime.utcnow()
        }

        # Insert notification first to get the ID
        result = await notification_collection.insert_one(notification_data)
        if not result.inserted_id:
            raise HTTPException(status_code=500, detail="Failed to create notification")

        notification_id = str(result.inserted_id)

        # Return the created notification
        notification_data["id"] = notification_id
        return Notification(**notification_data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# --- Get all notifications ---
@notification_router.get("/", response_model=List[Notification])
async def get_all_notifications():
    notifications = []
    async for notification in notification_collection.find().sort("createdAt", -1):
        notification["id"] = str(notification["_id"])
        del notification["_id"]
        notifications.append(Notification(**notification))
    return notifications

# --- Get notification by ID ---
@notification_router.get("/{notification_id}", response_model=Notification)
async def get_notification_by_id(notification_id: str):
    try:
        notification = await notification_collection.find_one({"_id": ObjectId(notification_id)})
        if notification:
            notification["id"] = str(notification["_id"])
            del notification["_id"]
            return Notification(**notification)
        raise HTTPException(status_code=404, detail="Notification not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID format")

# --- Update notification by ID ---
@notification_router.put("/{notification_id}", response_model=Notification)
async def update_notification(
        notification_id: str, 
        updated_data: UpdateNotificationRequest,
        current_user: dict = Depends(get_admin_or_super)
):
    try:
        update_fields = updated_data.dict(exclude_unset=True)

        result = await notification_collection.find_one_and_update(
            {"_id": ObjectId(notification_id)},
            {"$set": update_fields},
            return_document=True
        )

        if result:
            result["id"] = str(result["_id"])
            del result["_id"]
            return Notification(**result)
        raise HTTPException(status_code=404, detail="Notification not found")

    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID or update failed")

# --- Delete notification by ID ---
@notification_router.delete("/{notification_id}", status_code=204)
async def delete_notification(
        notification_id: str,
        current_user: dict = Depends(get_admin_or_super)
):
    try:
        result = await notification_collection.delete_one({"_id": ObjectId(notification_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        return
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID format") 