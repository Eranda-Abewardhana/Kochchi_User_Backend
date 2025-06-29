import json

example_json = {
    "title": "Vesak Dansala - Free Ice Cream",
    "organizer": {
        "name": "Youth Buddhist Society",
        "phone": "0776543210",
        "whatsapp": "0776543210",
        "email": "organizer@vesak.lk"
    },
    "location": {
        "city": "Kandy",
        "district": "Kandy",
        "province": "Central",
        "lat": "7.2905715",
        "lon": "80.6337262"
    },
    "foodType": "Ice Cream",
    "date": "2025-05-24",
    "time": "6:00 PM – 10:00 PM",
    "endDateTime": "2025-05-24T22:00:00",
    "description": "Join us for a refreshing ice cream dansala to celebrate Vesak near the Temple of the Tooth.",
    "createdAt": "2025-05-20T15:00:00",
    "updatedAt": "2025-05-20T15:00:00"
}

dansal_description = f"""
### Paste this JSON into the `data` field as a string:

```json
{json.dumps(example_json, indent=2)}
"""
