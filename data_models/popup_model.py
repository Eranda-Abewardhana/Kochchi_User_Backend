from pydantic import BaseModel, HttpUrl, Field
from typing import Optional
from datetime import datetime


class PopupAdCreate(BaseModel):
    title: str = Field(...)

class PopupAdOut(PopupAdCreate):
    adId: str
    image_url: Optional[HttpUrl]
    createdAt: datetime
    updatedAt: datetime
