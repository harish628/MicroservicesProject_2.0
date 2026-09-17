# models/payment.py
#
# What this file does:
# Defines the Payment and Refund tables in MySQL.
#
# Feynman version:
# Every time money changes hands in our app, we record it.
# Like a bank's transaction ledger — every debit and credit has a record.
#
# TWO tables:
#
# payments → one row per payment attempt
#   "User 5 tried to pay ₹12,500 for Order 42 — it SUCCEEDED at 10:32am"
#
# refunds → one row per refund
#   "Order 42's payment was refunded ₹12,500 on March 15 because order was cancelled"
#
# Why keep FAILED payments too?
# Because knowing that a user's card failed 3 times is useful data.
# Fraud detection, debugging, customer support — all need this history.

from config.database import db
from datetime import datetime
import uuid


def generate_transaction_id():
    """
    Generates a unique transaction ID like: TXN-2024-A3F9B2C1
    This is what we'd show customers on their receipt.
    In real apps, this comes from the payment gateway (Razorpay/Stripe).
    """
    return f"TXN-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"


class Payment(db.Model):
    __tablename__ = "payments"

    id             = db.Column(db.Integer, primary_key=True, autoincrement=True)
    transaction_id = db.Column(db.String(50), unique=True, nullable=False,
                               default=generate_transaction_id)
    order_id       = db.Column(db.Integer, nullable=False,
                               comment="Order ID from Order Service (no cross-DB FK)")
    user_id        = db.Column(db.Integer, nullable=False,
                               comment="User ID from Auth Service")
    amount         = db.Column(db.Numeric(10, 2), nullable=False)
    currency       = db.Column(db.String(3), default="INR", nullable=False)

    # Payment method: CARD, UPI, NETBANKING, WALLET, COD
    method         = db.Column(db.String(20), nullable=False)

    # Status: PENDING → SUCCESS or FAILED
    status         = db.Column(
                         db.Enum("PENDING", "SUCCESS", "FAILED"),
                         default="PENDING",
                         nullable=False
                     )

    # For card payments: we store only last 4 digits (never full card number — PCI compliance)
    card_last4     = db.Column(db.String(4), nullable=True)

    # Gateway response: in production this would be Razorpay/Stripe response
    gateway_ref    = db.Column(db.String(100), nullable=True,
                               comment="Payment gateway reference ID")
    failure_reason = db.Column(db.String(255), nullable=True,
                               comment="Why payment failed (if it did)")

    created_at     = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at     = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # One payment can have one refund
    refund         = db.relationship("Refund", backref="payment", uselist=False)

    def to_dict(self):
        """Convert to dictionary for JSON response"""
        return {
            "id":             self.id,
            "transaction_id": self.transaction_id,
            "order_id":       self.order_id,
            "user_id":        self.user_id,
            "amount":         float(self.amount),
            "currency":       self.currency,
            "method":         self.method,
            "status":         self.status,
            "card_last4":     self.card_last4,
            "gateway_ref":    self.gateway_ref,
            "failure_reason": self.failure_reason,
            "created_at":     self.created_at.isoformat(),
            "refund":         self.refund.to_dict() if self.refund else None,
        }


class Refund(db.Model):
    __tablename__ = "refunds"

    id             = db.Column(db.Integer, primary_key=True, autoincrement=True)
    refund_id      = db.Column(db.String(50), unique=True, nullable=False,
                               default=lambda: f"RFN-{uuid.uuid4().hex[:8].upper()}")
    payment_id     = db.Column(db.Integer, db.ForeignKey("payments.id"), nullable=False)
    amount         = db.Column(db.Numeric(10, 2), nullable=False,
                               comment="Refunded amount (could be partial)")
    reason         = db.Column(db.String(255), nullable=True)
    status         = db.Column(
                         db.Enum("PENDING", "PROCESSED"),
                         default="PENDING",
                         nullable=False
                     )
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":         self.id,
            "refund_id":  self.refund_id,
            "payment_id": self.payment_id,
            "amount":     float(self.amount),
            "reason":     self.reason,
            "status":     self.status,
            "created_at": self.created_at.isoformat(),
        }
