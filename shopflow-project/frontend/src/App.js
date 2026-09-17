// src/App.js
//
// What this file does:
// The root component. Sets up routing (which URL shows which page)
// and wraps everything in our Context providers (Auth + Cart) so
// every page and component can access login state and cart state.
//
// Feynman version:
// Think of this as the building's main floor plan.
// It decides: "if someone walks in through /checkout, show them the checkout room.
// If they walk in through /login, show them the login room."
// And the Context providers are like the building's electricity and water —
// invisible infrastructure every room depends on, supplied from one central source.

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Header from './components/Header';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';

import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="app-shell">
            <Header />
            <CartDrawer />

            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/"               element={<HomePage />} />
                <Route path="/product/:id"    element={<ProductDetailPage />} />
                <Route path="/login"          element={<LoginPage />} />
                <Route path="/register"       element={<RegisterPage />} />

                {/* Protected routes — require login */}
                <Route
                  path="/checkout"
                  element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>}
                />
                <Route
                  path="/orders"
                  element={<ProtectedRoute><OrdersPage /></ProtectedRoute>}
                />
              </Routes>
            </main>

            <footer className="site-footer">
              <div className="container footer-inner">
                <span>© 2026 ShopFlow — Built on 8 microservices</span>
                <span>Gateway: localhost:8000</span>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
