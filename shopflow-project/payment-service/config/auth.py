# config/auth.py
#
# What this file does:
# Flask decorator that verifies JWT tokens by calling Auth Service.
# Works exactly like the auth middleware in other services — same concept, Flask syntax.
#
# Feynman version:
# A decorator in Python is like a wrapper around a function.
# @require_auth wraps a route handler and says:
# "Before running this function, check the token first.
#  If token is invalid, stop here and return 401.
#  If token is valid, attach user info and proceed."

import requests
import os
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv

load_dotenv()

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")


def require_auth(f):
    """
    Decorator for routes that need a valid JWT token.
    Usage:
        @app.route('/api/payments', methods=['POST'])
        @require_auth
        def create_payment():
            user = request.user  # set by this decorator
            ...
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"error": "Authorization header required"}), 401

        try:
            response = requests.get(
                f"{AUTH_SERVICE_URL}/api/auth/verify-token",
                headers={"Authorization": auth_header},
                timeout=5
            )

            if response.status_code != 200:
                return jsonify({"error": "Invalid or expired token"}), 401

            # Attach user info to Flask's request object
            # Any route using @require_auth can read request.user
            request.user = response.json()

        except requests.exceptions.ConnectionError:
            return jsonify({"error": "Auth service unavailable"}), 503
        except Exception as e:
            return jsonify({"error": "Authentication failed"}), 401

        return f(*args, **kwargs)
    return decorated


def require_admin(f):
    """Decorator that requires admin role — wraps require_auth"""
    @wraps(f)
    @require_auth
    def decorated(*args, **kwargs):
        if request.user.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated
