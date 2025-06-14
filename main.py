from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

from routes.auth_routes import auth_router

app = FastAPI()



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

app.mount("/data_sources", StaticFiles(directory="data_sources"), name="data_sources")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)



