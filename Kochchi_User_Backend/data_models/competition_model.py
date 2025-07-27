from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime
from fastapi import Form

class Winner(BaseModel):
    name: str
    place: int
    location: str
    imageUrl: HttpUrl

class Competition(BaseModel):
    id: Optional[str]
    title: str
    content: str
    img_url: Optional[HttpUrl] = None
    createdAt: datetime
    is_completed: bool = False
    winners: List[Winner]  # ✅ Now expects list of Winner objects

class CreateCompetitionRequest(BaseModel):
    title: str
    content: str

class UpdateCompetitionRequest(BaseModel):
    title: Optional[str]
    content: Optional[str]
    
class AddWinnerRequest(BaseModel):
    name: str
    place: int
    location: str

    @classmethod
    def as_form(
        cls,
        name: str = Form(...),
        place: int = Form(...),
        location: str = Form(...),
    ):
        return cls(name=name, place=place, location=location)
