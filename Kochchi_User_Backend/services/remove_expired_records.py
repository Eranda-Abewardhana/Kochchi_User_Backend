from databases.mongo import db
from datetime import datetime, timedelta

dansal_collection = db["dansal"]
ads_collection = db["ads"]

async def remove_expired_dansals():
    now = datetime.utcnow()
    query = { "endDateTime": { "$lt": now } }

    result = await dansal_collection.delete_many(query)
    print(f"🧹 Deleted {result.deleted_count} expired dansal events.")


async def remove_old_non_top_non_carousal_ads():
    cutoff_date = datetime.utcnow() - timedelta(days=31)

    query = {
        "createdAt": {"$lt": cutoff_date},
        "adSettings.isTopAd": False,
        "adSettings.isCarousalAd": False
    }

    result = await ads_collection.delete_many(query)
    print(f"🧹 Deleted {result.deleted_count} old non-top non-carousal ads.")