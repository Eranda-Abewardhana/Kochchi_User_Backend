from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class BlogPost(BaseModel):
    id: Optional[str]
    title: str
    content: str
    img_url: Optional[HttpUrl] = None
    createdAt: datetime

class UpdateBlogRequest(BaseModel):
    title: Optional[str]
    content: Optional[str]
    img_url: Optional[HttpUrl] = None
