import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from routes.ads_routes import ads_router
from routes.auth_routes import auth_router
from routes.blog_routes import blog_router
from routes.category_routes import category_router
from routes.competition_routes import competition_router
from routes.dansal_routes import dansal_router
from routes.payment__routes import payment_router
from routes.pricing_routes import pricing_router
from routes.user_router import user_router

app = FastAPI()
load_dotenv()
BASE_URL = os.getenv("BASE_URL", "http://localhost")
PORT = int(os.getenv("PORT", 8000))


origins = [
    "*",  # Deployed frontend
]

app.add_middleware(
    CORSMiddleware,       # Allow specific origins
    allow_credentials=True,
    allow_origins=["*"],
    # Allow cookies to be sent
    allow_methods=["*"],          # Allow all HTTP methods
    allow_headers=["*"],          # Allow all headers
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(ads_router)

app.include_router(competition_router)
app.include_router(blog_router)
app.include_router(payment_router)

app.include_router(dansal_router)
app.include_router(pricing_router)
app.include_router(category_router)

app.mount("/data_sources", StaticFiles(directory="data_sources"), name="data_sources")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=BASE_URL, port=PORT)



