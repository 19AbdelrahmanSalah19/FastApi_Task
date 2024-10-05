from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Access the variable
SQLALCHEMY_DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL")

#print(SQLALCHEMY_DATABASE_URL)

# Database connection URL
#SQLALCHEMY_DATABASE_URL = "mssql+pyodbc://LAPTOP-HDOI01HS\\SQLEXPRESS01/technia_task?driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"

# Create SQLAlchemy engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()