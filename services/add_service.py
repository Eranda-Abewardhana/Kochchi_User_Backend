from http.client import HTTPException

from fastapi import Form
from pydantic import ValidationError

from data_models.ads_model import AdCreateSchema
import json


def get_ad_model(ad_json: str = Form(...)) -> AdCreateSchema:
    try:
        return AdCreateSchema(**json.loads(ad_json))
    except (json.JSONDecodeError, ValidationError) as e:
        raise HTTPException(status_code=422, detail=f"Invalid ad_json format: {str(e)}")