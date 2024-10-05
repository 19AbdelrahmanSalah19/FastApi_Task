from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router
from database import engine
import models


# Create database tables if they do not exist
models.Base.metadata.create_all(bind=engine)

# FastAPI app instance
app = FastAPI()

# CORS setup for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Corrected this line
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the login router
app.include_router(router)