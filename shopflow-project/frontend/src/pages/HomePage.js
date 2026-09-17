// src/pages/HomePage.js
//
// The main storefront — hero, category filter pills, search bar, product grid.
// This is the page that talks to Product Service (via the Gateway) the most.

import { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import { productsApi } from '../api/products';

export default function HomePage() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Fetch categories once on mount
  useEffect(() => {
    productsApi.getCategories()
      .then(setCategories)
      .catch(() => {}); // categories are non-critical — fail silently
  }, []);

  // Fetch products whenever category or search changes
  // useCallback so this function reference is stable for useEffect's dependency array
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { per_page: 24 };
      if (activeCategory) params.category_id = activeCategory;
      if (search)         params.search = search;

      const data = await productsApi.getAll(params);
      setProducts(data.products);
    } catch (err) {
      setError('Could not load products. Is the Product Service running?');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    // Debounce search — wait 400ms after typing stops before calling the API
    // Feynman: like waiting for someone to finish a sentence before responding,
    // instead of interrupting after every single word they type.
    const timer = setTimeout(fetchProducts, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchProducts, search]);

  return (
    <div className="home-page">
      <section className="hero-v2">
        <div className="container hero-v2-inner">
          <div className="hero-v2-copy">
            <div className="hero-eyebrow">THE EVERYDAY EDIT / 02</div>
            <h1>Good things,<br /><em>flowing</em> your way.</h1>
            <p>Thoughtful gear for work, rest, movement, and everything in between. Curated daily, delivered simply.</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#catalog">Explore the edit <span>↘</span></a>
              <span className="hero-note"><span className="hero-note-dot"></span> New drops every week</span>
            </div>
          </div>
          <div className="hero-v2-art">
            <div className="hero-orbit orbit-one"></div>
            <div className="hero-orbit orbit-two"></div>
            <img src="https://picsum.photos/id/96/900/1100" alt="Featured ShopFlow product" />
            <div className="hero-product-tag">
              <span>FEATURED FIND</span>
              <strong>Made for the<br />long way around.</strong>
              <b>↗</b>
            </div>
            <div className="hero-index">01<span>/</span>04</div>
          </div>
        </div>
      </section>

      <div className="container trust-strip">
        <span><b>01</b> Curated, not crowded</span>
        <span><b>02</b> Honest prices</span>
        <span><b>03</b> Easy returns</span>
        <span><b>04</b> Built for real life</span>
      </div>

      <div className="container catalog-shell" id="catalog">
        <div className="catalog-heading">
          <div>
            <div className="section-kicker">SHOP THE CURRENT EDIT</div>
            <h2>{search ? `Results for “${search}”` : 'Find your next favourite.'}</h2>
          </div>
          <div className="catalog-count">{products.length > 0 ? `${products.length} pieces` : 'Browse all pieces'}</div>
        </div>

        <div className="search-bar search-bar-v2">
          <span>⌕</span>
        <input
          type="text"
          placeholder="Search the collection..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
          {search && <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">×</button>}
        </div>

        {categories.length > 0 && (
          <div className="category-row category-row-v2">
            <button className={`category-pill ${!activeCategory ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>All pieces</button>
            {categories.map((cat) => (
              <button key={cat.id} className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => setActiveCategory(cat.id)}>
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <p className="loading-text">Loading products...</p>}

      {error && (
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>No products found. Try a different search or category.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="container product-grid product-grid-v2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
