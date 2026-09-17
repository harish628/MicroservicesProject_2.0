# config/database.py
#
# What this file does:
# Sets up the SQLAlchemy database connection for Flask.
#
# Feynman version:
# Flask-SQLAlchemy is like a built-in translator that comes WITH Flask.
# You give it the MySQL address, it manages connections automatically.
# Every time a request comes in, Flask gives it a fresh DB connection.
# When the request is done, it closes the connection cleanly.
# You don't manage any of this manually — Flask-SQLAlchemy handles it.

from flask_sqlalchemy import SQLAlchemy

# db is the global SQLAlchemy instance
# We create it here and attach it to the Flask app in app.py
# Every model (table) will inherit from db.Model
db = SQLAlchemy()


def init_db(app):
    """
    Attach the database to the Flask app and create all tables.
    Called once at startup in app.py.
    """
    db.init_app(app)

    with app.app_context():
        # Import models here so SQLAlchemy knows about them before creating tables
        from models.payment import Payment, Refund
        db.create_all()
        print("✅ Payment database tables created / verified")
