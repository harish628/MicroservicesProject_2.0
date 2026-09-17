// src/components/Header.js
//
// The site header — logo, nav links, search trigger, cart icon with badge,
// and login/logout depending on auth state.

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header site-header-v2">
      <div className="header-inner">
        <Link to="/" className="logo">
          <span className="logo-mark">S</span> ShopFlow<span className="dot">/</span>
        </Link>

        <nav className="nav-actions">
          <Link to="/" className="nav-link nav-link-active">Shop</Link>

          {isAuthenticated && (
            <Link to="/orders" className="nav-link">My Orders</Link>
          )}

          {isAdmin && (
            <a
              href="http://localhost:4200"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              Admin ↗
            </a>
          )}

          <button
            className="icon-btn"
            onClick={() => setIsOpen(true)}
            aria-label="Open cart"
          >
            <span className="bag-icon">▱</span>
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>

          {isAuthenticated ? (
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              {user?.name?.split(' ')[0] || 'Account'}
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
