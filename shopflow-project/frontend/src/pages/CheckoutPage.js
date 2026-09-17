// src/pages/CheckoutPage.js
//
// The most important page in the app — where Order Service AND Payment
// Service both get called in sequence. This is the real end-to-end flow:
//   1. Customer fills delivery address
//   2. Customer picks payment method
//   3. We call Order Service → creates the order (status: PENDING)
//   4. We call Payment Service → charges payment (status becomes CONFIRMED)
//   5. We clear the cart and redirect to the order confirmation

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersApi, paymentsApi } from '../api/orders';

const PAYMENT_METHODS = [
  { id: 'CARD',       label: '💳 Card' },
  { id: 'UPI',        label: '📱 UPI' },
  { id: 'NETBANKING', label: '🏦 Net Banking' },
];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({ street: '', city: '', pincode: '' });
  const [method, setMethod]   = useState('CARD');
  const [step, setStep]       = useState('idle'); // idle | placing | paying | done
  const [error, setError]     = useState('');

  const handleAddressChange = (e) =>
    setAddress({ ...address, [e.target.name]: e.target.value });

  const handlePlaceOrder = async () => {
    setError('');

    if (!address.street || !address.city || !address.pincode) {
      setError('Please fill in your complete delivery address.');
      return;
    }

    try {
      // ── Step 1: Create the order via Order Service ──────────────────
      setStep('placing');
      const orderRes = await ordersApi.create({
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        delivery_address: address,
      });

      const orderId = orderRes.order.id;

      // ── Step 2: Process payment via Payment Service ──────────────────
      setStep('paying');
      const paymentRes = await paymentsApi.process({
        order_id: orderId,
        amount:   totalPrice,
        method,
      });

      if (!paymentRes.success) {
        setError(`Payment failed: ${paymentRes.payment.failure_reason}. Your order was saved — you can retry payment from My Orders.`);
        setStep('idle');
        return;
      }

      // ── Step 3: Success — clear cart and go to confirmation ─────────
      clearCart();
      setStep('done');
      navigate('/orders', { state: { justPlaced: orderId } });

    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong placing your order.');
      setStep('idle');
    }
  };

  if (items.length === 0 && step !== 'done') {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">🧺</div>
          <p>Your cart is empty. Add some products before checking out.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="checkout-grid">
        <div>
          <div className="checkout-section">
            <h3>Delivery Address</h3>

            <div className="field">
              <label>Street Address</label>
              <input
                name="street"
                value={address.street}
                onChange={handleAddressChange}
                placeholder="123 MG Road, Apartment 4B"
              />
            </div>
            <div className="field">
              <label>City</label>
              <input
                name="city"
                value={address.city}
                onChange={handleAddressChange}
                placeholder="Hyderabad"
              />
            </div>
            <div className="field">
              <label>Pincode</label>
              <input
                name="pincode"
                value={address.pincode}
                onChange={handleAddressChange}
                placeholder="500001"
              />
            </div>
          </div>

          <div className="checkout-section">
            <h3>Payment Method</h3>
            <div className="method-grid">
              {PAYMENT_METHODS.map((m) => (
                <div
                  key={m.id}
                  className={`method-option ${method === m.id ? 'selected' : ''}`}
                  onClick={() => setMethod(m.id)}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}
        </div>

        <div className="receipt-box">
          <h3>Order Summary</h3>

          {items.map((item) => (
            <div className="summary-row" key={item.product_id}>
              <span>{item.name} × {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}

          <div className="summary-total">
            <span>Total</span>
            <span>₹{totalPrice.toLocaleString('en-IN')}</span>
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={handlePlaceOrder}
            disabled={step === 'placing' || step === 'paying'}
          >
            {step === 'placing' && 'Placing order...'}
            {step === 'paying'   && 'Processing payment...'}
            {step === 'idle'     && `Pay ₹${totalPrice.toLocaleString('en-IN')}`}
          </button>
        </div>
      </div>
    </div>
  );
}
