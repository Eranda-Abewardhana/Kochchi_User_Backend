import json

example_json = {
    "shopName": "The Curry Hut",
    "contact": {
        "address": "123 Main St",
        "phone": "0771234567",
        "whatsapp": "0771234567",
        "email": "example@email.com",
        "website": "https://curryhut.lk"
    },
    "location": {
        "googleMapLocation": "6.9271,79.8612",
        "city": "Colombo",
        "district": "Colombo",
        "province": "Western",
        "country": "Sri Lanka",
        "state": "N/A"
    },
    "business": {
        "category": "Restaurant",
        "specialty": "Indian",
        "tags": ["Spicy", "Vegetarian"],
        "halalAvailable": True,
        "description": "Authentic Sri Lankan and Indian dishes",
        "menuOptions": ["Rice & Curry", "Biryani"]
    },
    "schedule": {
        "mon": ["10:00-22:00"],
        "tue": ["10:00-22:00"],
        "wed": ["10:00-22:00"],
        "thu": ["10:00-22:00"],
        "fri": ["10:00-22:00"],
        "sat": ["10:00-23:00"],
        "sun": ["10:00-23:00"]
    },
    "adSettings": {
        "isTopAd": False,
        "isCarousalAd": True,
        "hasHalal":  False
    },
    "videoUrl": "https://example.com/video.mp4"
}

ads_description = f"""
### Paste this JSON into the `data` field as a string:

```json
{json.dumps(example_json, indent=2)}
"""