# handlers/payment_handler.py
#
# What this file does:
# All payment business logic — process payment, get payment, refund.
#
# Feynman version:
# This is the CASHIER of our store.
# - process_payment() → customer hands over card/UPI, cashier charges it
# - get_payment()     → show receipt for a specific transaction
# - get_order_payment()→ show payment for a specific order
# - process_refund()  → return money to customer
#
# IMPORTANT: This is a MOCK payment service.
# We simulate payments without connecting to a real bank.
# In production, you'd replace the mock logic with:
#   - Razorpay API (popular in India)
#   - Stripe API (popular globally)
# The rest of the code structure stays the same.

import os
import random
import requests
from flask import request, jsonify
from config.database import db
from config.auth import require_auth, require_admin
from models.payment import Payment, Refund

ORDER_SERVICE_URL = os.getenv("ORDER_SERVICE_URL", "http://localhost:8003")

# Configurable mock success rate (default 95%)
# In testing you can set PAYMENT_SUCCESS_RATE=0 to always fail
PAYMENT_SUCCESS_RATE = float(os.getenv("PAYMENT_SUCCESS_RATE", 0.95))


# ── PROCESS PAYMENT ──────────────────────────────────────────────────────────
# POST /api/payments
#
# What the client sends:
# {
#   "order_id": 42,
#   "amount": 12500.00,
#   "method": "CARD",          # CARD | UPI | NETBANKING | WALLET | COD
#   "card_last4": "4242",      # only for CARD payments
# }
#
# Flow:
# 1. Validate input
# 2. Check this order doesn't already have a successful payment
# 3. Mock the payment gateway (simulate success/failure)
# 4. Save transaction to MySQL
# 5. If success → tell Order Service to update status to CONFIRMED
# 6. Return result

def process_payment():
    data    = request.get_json()
    user_id = request.user["user_id"]

    # ── Validation ────────────────────────────────────────────────────────
    required = ["order_id", "amount", "method"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"'{field}' is required"}), 400

    valid_methods = ["CARD", "UPI", "NETBANKING", "WALLET", "COD"]
    if data["method"] not in valid_methods:
        return jsonify({"error": f"Invalid method. Choose from: {valid_methods}"}), 400

    if data["amount"] <= 0:
        return jsonify({"error": "Amount must be greater than 0"}), 400

    # ── Check for duplicate payment ───────────────────────────────────────
    # Prevent charging someone twice for the same order
    existing = Payment.query.filter_by(
        order_id=data["order_id"],
        status="SUCCESS"
    ).first()

    if existing:
        return jsonify({
            "error":   "Order already has a successful payment",
            "payment": existing.to_dict()
        }), 409  # 409 Conflict

    # ── Mock Payment Gateway ──────────────────────────────────────────────
    # Feynman: In real life, we'd send card details to Razorpay/Stripe.
    # They'd charge the card and send back: success or failure + reason.
    # Here we simulate that with a random number.
    #
    # PAYMENT_SUCCESS_RATE = 0.95 means 95% of payments succeed.
    # The 5% that fail get a random failure reason (like a real gateway would return).

    mock_success = random.random() < PAYMENT_SUCCESS_RATE

    failure_reasons = [
        "Insufficient funds",
        "Card declined by bank",
        "Invalid card details",
        "Transaction limit exceeded",
        "Network timeout",
    ]

    payment_status = "SUCCESS" if mock_success else "FAILED"
    failure_reason = None if mock_success else random.choice(failure_reasons)
    gateway_ref    = f"GW-{os.urandom(4).hex().upper()}" if mock_success else None

    # ── Save Payment Record ───────────────────────────────────────────────
    payment = Payment(
        order_id       = data["order_id"],
        user_id        = user_id,
        amount         = data["amount"],
        method         = data["method"],
        status         = payment_status,
        card_last4     = data.get("card_last4"),
        gateway_ref    = gateway_ref,
        failure_reason = failure_reason,
    )
    db.session.add(payment)
    db.session.commit()

    # ── If Successful → Notify Order Service ─────────────────────────────
    # Tell Order Service: "Payment confirmed, update order status to CONFIRMED"
    # Feynman: After the cashier successfully charges your card,
    # they tell the kitchen: "Order #42 is paid — start preparing it."

    if mock_success:
        try:
            auth_header = request.headers.get("Authorization")
            requests.put(
                f"{ORDER_SERVICE_URL}/api/orders/{data['order_id']}/status",
                json={"status": "CONFIRMED"},
                headers={"Authorization": auth_header},
                timeout=5,
            )
        except Exception as e:
            # Log but don't fail the payment — order can be reconciled manually
            print(f"⚠️  Failed to update order status: {e}")

    status_code = 200 if mock_success else 402  # 402 = Payment Required

    return jsonify({
        "success": mock_success,
        "message": "Payment successful" if mock_success else f"Payment failed: {failure_reason}",
        "payment": payment.to_dict(),
    }), status_code


# ── GET PAYMENT BY ID ─────────────────────────────────────────────────────────
# GET /api/payments/<payment_id>

def get_payment(payment_id):
    payment = Payment.query.get(payment_id)

    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    # Security: customers can only see their own payments
    if request.user["role"] != "admin" and payment.user_id != request.user["user_id"]:
        return jsonify({"error": "Access denied"}), 403

    return jsonify({"payment": payment.to_dict()}), 200


# ── GET PAYMENT BY ORDER ID ───────────────────────────────────────────────────
# GET /api/payments/order/<order_id>
# Used by Order Service and frontend to check if an order has been paid

def get_order_payment(order_id):
    payment = Payment.query.filter_by(
        order_id=order_id,
        status="SUCCESS"
    ).first()

    if not payment:
        return jsonify({"error": "No successful payment found for this order"}), 404

    # Security check
    if request.user["role"] != "admin" and payment.user_id != request.user["user_id"]:
        return jsonify({"error": "Access denied"}), 403

    return jsonify({"payment": payment.to_dict()}), 200


# ── PROCESS REFUND ────────────────────────────────────────────────────────────
# POST /api/payments/<payment_id>/refund
# Admin initiates a refund for a successful payment
#
# What client sends: { "reason": "Customer requested cancellation" }
#
# Feynman: Like reversing a bank transaction.
# The cashier processes a "return" — money goes back to the customer.
# We record the refund separately so there's always a full audit trail.

def process_refund(payment_id):
    data    = request.get_json() or {}
    payment = Payment.query.get(payment_id)

    if not payment:
        return jsonify({"error": "Payment not found"}), 404

    if payment.status != "SUCCESS":
        return jsonify({"error": "Can only refund successful payments"}), 400

    if payment.refund:
        return jsonify({"error": "Payment already refunded"}), 409

    # Create refund record
    refund = Refund(
        payment_id = payment.id,
        amount     = payment.amount,  # full refund
        reason     = data.get("reason", "Refund requested"),
        status     = "PROCESSED",
    )
    db.session.add(refund)

    # Update order status to REFUNDED
    try:
        auth_header = request.headers.get("Authorization")
        requests.put(
            f"{ORDER_SERVICE_URL}/api/orders/{payment.order_id}/status",
            json={"status": "REFUNDED"},
            headers={"Authorization": auth_header},
            timeout=5,
        )
    except Exception as e:
        print(f"⚠️  Failed to update order status to REFUNDED: {e}")

    db.session.commit()

    return jsonify({
        "message": "Refund processed successfully",
        "refund":  refund.to_dict(),
    }), 200


# ── GET ALL PAYMENTS (ADMIN) ──────────────────────────────────────────────────
# GET /api/payments?status=SUCCESS&page=1

def get_all_payments():
    status   = request.args.get("status")
    page     = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    query = Payment.query
    if status:
        query = query.filter_by(status=status)

    total    = query.count()
    payments = query.order_by(Payment.created_at.desc()) \
                    .offset((page - 1) * per_page) \
                    .limit(per_page) \
                    .all()

    import math
    return jsonify({
        "payments":    [p.to_dict() for p in payments],
        "total":       total,
        "page":        page,
        "per_page":    per_page,
        "total_pages": math.ceil(total / per_page),
    }), 200
