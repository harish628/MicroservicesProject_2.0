# routes/payment_routes.py
#
# What this file does:
# Registers all payment routes with Flask and attaches the right auth decorators.
#
# Feynman version:
# This is the cashier counter's signboard:
#   "Pay here" → process_payment (any logged-in customer)
#   "View receipt" → get_payment (owner or admin)
#   "Check if order is paid" → get_order_payment (owner or admin)
#   "Process refund" → process_refund (admin only)
#   "View all transactions" → get_all_payments (admin only)

from flask import Blueprint
from config.auth import require_auth, require_admin
from handlers.payment_handler import (
    process_payment,
    get_payment,
    get_order_payment,
    process_refund,
    get_all_payments,
)

# Blueprint groups all payment routes under /api/payments
payment_bp = Blueprint("payments", __name__, url_prefix="/api/payments")

# Customer routes
payment_bp.add_url_rule("",                        view_func=require_auth(process_payment),           methods=["POST"])
payment_bp.add_url_rule("/<int:payment_id>",        view_func=require_auth(get_payment),               methods=["GET"])
payment_bp.add_url_rule("/order/<int:order_id>",    view_func=require_auth(get_order_payment),         methods=["GET"])

# Admin routes
payment_bp.add_url_rule("/admin/all",               view_func=require_admin(get_all_payments),         methods=["GET"])
payment_bp.add_url_rule("/<int:payment_id>/refund", view_func=require_admin(process_refund),           methods=["POST"])
