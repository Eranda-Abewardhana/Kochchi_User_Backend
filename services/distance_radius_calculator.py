from fastapi import Query
from math import radians, sin, cos, sqrt, atan2

# Haversine distance (km)
def calculate_distance(lat1, lng1, lat2, lng2):
    R = 6371.0  # Earth radius in km

    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)

    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c
