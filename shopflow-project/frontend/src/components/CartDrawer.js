// src/components/CartDrawer.js
//
// The signature element of our design: a cart that looks and feels like
// a real paper receipt sliding in from the right — monospace numbers,
// a dashed divider before the total, just like a real till receipt.

import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartDrawer() {
  const {
    items, isOpen, setIsOpen,
    updateQuantity, removeItem,
    totalItems, totalPrice,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsOpen(false);
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <>
      <div
        className={`cart-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div><span className="drawer-kicker">YOUR SELECTION</span><h3>Your Cart <small>({totalItems})</small></h3></div>
          <button className="cart-close" onClick={() => setIsOpen(false)} aria-label="Close cart">
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🧺</div>
            <p>Your cart is empty.<br />Add something you like!</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-line" key={item.product_id}>
                  <div className="cart-line-thumb">{item.image_url ? <img src={item.image_url} alt="" /> : '◌'}</div>

                  <div className="cart-line-info">
                    <p className="cart-line-name">{item.name}</p>
                    <div className="qty-control">
                      <button onClick={() => updateQuantity(item.product_id, -1)}>−</button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-line-price">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Items ({totalItems})</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span>FREE</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <button className="btn btn-primary btn-block" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
