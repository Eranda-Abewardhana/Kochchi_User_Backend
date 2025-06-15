from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime

class Winner(BaseModel):
    name: str
    place: int
    location: str
    imageUrl: Optional[HttpUrl] = None

class Competition(BaseModel):
    id: Optional[str]
    title: str
    content: str
    img_url: Optional[HttpUrl] = None
    createdAt: datetime
    is_completed: bool = False
    winners: List[Winner] = []

class CreateCompetitionRequest(BaseModel):
    title: str
    content: str
    img_url: Optional[HttpUrl] = None

class UpdateCompetitionRequest(BaseModel):
    title: Optional[str]
    content: Optional[str]
    img_url: Optional[HttpUrl] = None

class AddWinnersRequest(BaseModel):
    winners: List[Winner]
