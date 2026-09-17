# config/auth.py
#
# What this file does:
# Verifies JWT tokens by calling the Auth Service.
# Acts as the "security checkpoint" for protected routes.
#
# Feynman version:
# The Product Service doesn't know how to read JWT tokens.
# It's not its job — Auth Service owns that.
# So when a protected request comes in, Product Service picks up the phone
# and calls Auth Service: "Hey, is this token valid?"
# Auth Service says yes/no + who the user is.
# Product Service then decides: let them in or reject them.
#
# This is microservices communication in action!

import httpx
import os
from fastapi import HTTPException, Header
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")


async def verify_token(authorization: Optional[str] = Header(None)) -> dict:
    """
    FastAPI dependency that verifies the JWT token.
    Used like: user = Depends(verify_token) in any protected route.

    What it does:
    1. Reads the Authorization header from the incoming request
    2. Calls Auth Service GET /api/auth/verify-token with the same token
    3. If valid → returns user info dict (user_id, email, role)
    4. If invalid → raises 401 Unauthorized (FastAPI handles the error response)
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    # Call Auth Service to verify the token
    # httpx is Python's async HTTP client (like requests but async)
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{AUTH_SERVICE_URL}/api/auth/verify-token",
                headers={"Authorization": authorization},
                timeout=5.0   # don't wait more than 5 seconds
            )
        except httpx.RequestError:
            raise HTTPException(status_code=503, detail="Auth service unavailable")

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return response.json()   # { valid, user_id, email, role }


async def admin_only(authorization: Optional[str] = Header(None)) -> dict:
    """
    Like verify_token but also checks role = 'admin'.
    Used for routes that only admins can access (add product, delete product, etc.)
    """
    user = await verify_token(authorization)

    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    return user
