// src/components/ProductCard.js
//
// A single product card shown in the grid. Click anywhere → product detail.
// The "+" button adds directly to cart WITHOUT navigating away — a small
// but important UX detail real e-commerce sites get right.

import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const stockStatus =
    product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : 'in';

  const stockLabel =
    product.stock === 0 ? 'Sold out' : product.stock <= 5 ? `${product.stock} left` : 'In stock';

  const handleAddToCart = (e) => {
    e.stopPropagation(); // don't trigger the card's navigate-to-detail click
    if (product.stock > 0) addItem(product);
  };

  return (
    <article className="product-card product-card-v2" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="product-image">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="product-image-img"
            onError={(e) => {
              // If the image URL is broken, hide the <img> and let the
              // emoji fallback (rendered alongside) show through instead
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <span className="product-image-fallback" style={{ display: product.image_url ? 'none' : 'flex' }}>
          📦
        </span>
        <span className={`stock-tag ${stockStatus === 'in' ? '' : stockStatus}`}>
          {stockLabel}
        </span>
        <span className="product-arrow">↗</span>
      </div>

      <div className="product-info">
        {product.category && (
          <div className="product-category">{product.category.name}</div>
        )}
        <h3 className="product-name">{product.name}</h3>
        {product.description && <p className="product-description">{product.description}</p>}

        <div className="product-footer">
          <span className="product-price">
            <span className="symbol">₹</span>
            {Number(product.price).toLocaleString('en-IN')}
          </span>
          <button
            className="add-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label="Add to cart"
          >
            + <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  );
}
