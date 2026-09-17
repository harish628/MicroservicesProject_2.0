// src/pages/OrdersPage.js
//
// Customer's order history — calls Order Service via the Gateway.
// Shows status badges, line items, and a cancel button for PENDING orders.

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ordersApi } from '../api/orders';

export default function OrdersPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await ordersApi.getMyOrders();
      setOrders(data.orders);
    } catch (err) {
      setError('Could not load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    try {
      await ordersApi.cancel(orderId);
      fetchOrders(); // refresh list to show updated status
    } catch (err) {
      alert(err.response?.data?.error || 'Could not cancel this order.');
    }
  };

  return (
    <div className="container">
      <div className="section-header">
        <h2>My Orders</h2>
      </div>

      {justPlaced && (
        <div
          className="error-banner"
          style={{ background: '#E1F5EE', color: '#0F6E56', border: '1px solid #9FE1CB' }}
        >
          ✅ Order #{justPlaced} placed successfully! Track its status below.
        </div>
      )}

      {loading && <p className="loading-text">Loading your orders...</p>}

      {error && (
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>You haven't placed any orders yet.</p>
        </div>
      )}

      {!loading && orders.map((order) => (
        <div className="order-card" key={order.id}>
          <div className="order-top">
            <div>
              <div className="order-id">Order #{order.id}</div>
              <div className="order-date">
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </div>
            </div>
            <span className={`status-badge status-${order.status}`}>{order.status}</span>
          </div>

          <div className="order-items-list">
            {order.items?.map((item) => (
              <div key={item.id}>
                {item.product_name} × {item.quantity} — ₹{Number(item.subtotal).toLocaleString('en-IN')}
              </div>
            ))}
          </div>

          <div className="order-total">
            <span>Total</span>
            <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
          </div>

          {order.status === 'PENDING' && (
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: 16 }}
              onClick={() => handleCancel(order.id)}
            >
              Cancel Order
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
