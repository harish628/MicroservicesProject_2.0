# config/database.py
#
# What this file does:
# Opens the connection to MySQL and gives every other file a way to use it.
#
# Feynman version:
# Think of this file as the "water pipe" in your house.
# You don't install a new pipe every time you want water.
# You install it ONCE and every tap in the house connects to it.
# This file is that central pipe — installed once at startup,
# used by every handler that needs to talk to MySQL.

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

# Build the MySQL connection URL
# Format: mysql+pymysql://user:password@host:port/database
DATABASE_URL = (
    f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)

# create_engine is like "installing the pipe"
# pool_pre_ping=True means: test the connection before using it (health check)
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# SessionLocal is a "factory" for database sessions
# Every time we need to talk to MySQL, we create a Session from this factory
# Think of it like: factory makes cups, each request gets its own cup, throws it away when done
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base is the parent class all our database models (tables) will inherit from
# It's how SQLAlchemy knows "this Python class = a MySQL table"
Base = declarative_base()


# get_db() is a FastAPI "dependency"
# It creates a DB session for each request and CLOSES it when the request is done
# The "yield" keyword is what makes this work — it's like:
#   1. Open the tap (create session)
#   2. Let the handler use the water (yield db)
#   3. Close the tap when done (finally: db.close())
#
# We use this with FastAPI's Depends() — you'll see it in every handler
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
