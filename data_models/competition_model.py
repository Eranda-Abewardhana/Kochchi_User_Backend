from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class Competition(BaseModel):
    id: Optional[str]
    title: str
    content: str
    img_url: Optional[HttpUrl] = None
    createdAt: datetime

class CreateCompetitionRequest(BaseModel):
    title: str
    content: str
    img_url: Optional[HttpUrl] = None

class UpdateCompetitionRequest(BaseModel):
    title: Optional[str]
    content: Optional[str]
    img_url: Optional[HttpUrl] = None
