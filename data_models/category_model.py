from pydantic import BaseModel, Field
from typing import Optional

class Category(BaseModel):
    name: str = Field(...)
    description: Optional[str] = Field(...)
    image_url: Optional[str] = Field(...)

class CategoryResponse(Category):
    id: str = Field(..., example="665f29e12ba6a0a5d7e1c2b4")

class CreateCategoryResponse(BaseModel):
    message: str
    category_id: str

class ErrorResponse(BaseModel):
    detail: str
