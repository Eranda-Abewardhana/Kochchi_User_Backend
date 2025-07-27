from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Notification(BaseModel):
    id: Optional[str]
    title: str
    description: str
    createdAt: datetime

class UpdateNotificationRequest(BaseModel):
    title: Optional[str]
    description: Optional[str] 