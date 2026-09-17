# app.py
#
# What this file does:
# Entry point for the Payment Service.
# Creates the Flask app, configures MySQL, registers routes, starts the server.
#
# Feynman version:
# Flask is like a lightweight version of FastAPI — also Python, also for building APIs.
# The difference:
#   FastAPI → modern, async, auto-generates docs, uses Pydantic for validation
#   Flask   → simpler, synchronous, more manual control, huge ecosystem
# Both are excellent. We use Flask here so you experience both frameworks.
#
# Run with: python app.py

from flask import Flask, jsonify
from dotenv import load_dotenv
import os

load_dotenv()

from config.database import init_db
from routes.payment_routes import payment_bp


def create_app():
    """
    Application factory pattern — creates and configures the Flask app.
    Feynman: Like a factory that builds a car. You call create_app()
    and get back a fully configured Flask application, ready to run.
    """
    app = Flask(__name__)

    # ── MySQL Configuration ───────────────────────────────────────────────
    # Flask-SQLAlchemy reads this config to know where MySQL is
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )
    # Disable modification tracking — saves memory, not needed for our use
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JSON_SORT_KEYS"] = False  # keep JSON key order as-is

    # ── Initialize Database ───────────────────────────────────────────────
    init_db(app)

    # ── Register Routes ───────────────────────────────────────────────────
    app.register_blueprint(payment_bp)

    # ── Health Check ──────────────────────────────────────────────────────
    @app.route("/health")
    def health():
        return jsonify({
            "status":  "ok",
            "service": "payment-service",
            "port":    os.getenv("PORT", "8004"),
        })

    # ── 404 Handler ───────────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Route not found"}), 404

    # ── 500 Handler ───────────────────────────────────────────────────────
    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    app  = create_app()
    port = int(os.getenv("PORT", 8004))

    print(f"🚀 Payment Service running on port {port}")
    print(f"📋 Routes:")
    print(f"   POST   /api/payments                   [customer] Process payment")
    print(f"   GET    /api/payments/<id>               [customer] Get payment by ID")
    print(f"   GET    /api/payments/order/<order_id>   [customer] Get payment by order")
    print(f"   GET    /api/payments/admin/all          [admin]    All payments")
    print(f"   POST   /api/payments/<id>/refund        [admin]    Process refund")
    print(f"   GET    /health")

    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_ENV") == "development")
