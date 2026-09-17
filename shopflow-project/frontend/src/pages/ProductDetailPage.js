// src/pages/ProductDetailPage.js
//
// Single product view — full description, price, stock status, add to cart.

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi } from '../api/products';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, setIsOpen } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    setLoading(true);
    productsApi.getById(id)
      .then(setProduct)
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="loading-text">Loading product...</p>;

  if (error || !product) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p>{error || 'Product not found.'}</p>
          <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
            Back to shop
          </button>
        </div>
      </div>
    );
  }

  const stockStatus = product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : '';
  const stockLabel =
    product.stock === 0
      ? 'Out of stock'
      : product.stock <= 5
      ? `Only ${product.stock} left in stock`
      : 'In stock and ready to ship';

  const handleAddToCart = () => {
    addItem(product);
  };

  const handleBuyNow = () => {
    addItem(product);
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <div className="container">
      <div className="detail-grid">
        <div className="detail-image">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="detail-image-img"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <span
            className="detail-image-fallback"
            style={{ display: product.image_url ? 'none' : 'flex' }}
          >
            📦
          </span>
        </div>

        <div>
          {product.category && (
            <div className="detail-category">{product.category.name}</div>
          )}
          <h1 className="detail-name">{product.name}</h1>
          <div className="detail-price">₹{Number(product.price).toLocaleString('en-IN')}</div>

          <p className="detail-desc">
            {product.description || 'No description available for this product.'}
          </p>

          <div className={`detail-stock ${stockStatus}`}>
            <span className="dot"></span>
            {stockLabel}
          </div>

          <div className="detail-actions">
            <button
              className="btn btn-outline"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>
            <button
              className="btn btn-primary"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
