// src/context/CartContext.js
//
// What this file does:
// Manages the shopping cart GLOBALLY using React state (in-memory only).
//
// Feynman version:
// Think of the cart like a real shopping basket you carry around the store.
// Every aisle (page) you visit, the basket is still in your hand with
// whatever you've already added. CartContext is that basket — any component
// can add items, remove items, or check what's inside.
//
// IMPORTANT: This cart lives in memory only (React state).
// Refreshing the page will clear it — this is a deliberate simplification
// for the learning project. A production app might persist this to the
// backend (a "cart service") or browser storage.

import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  // items: [{ product_id, name, price, quantity, stock }]
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // addItem — adds a product to the cart, or increases quantity if already there
  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);

      if (existing) {
        // Already in cart — increase quantity (but don't exceed stock)
        return prev.map((i) =>
          i.product_id === product.id
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
            : i
        );
      }

      // New item — add with quantity 1
      return [
        ...prev,
        {
          product_id: product.id,
          name:       product.name,
          price:      product.price,
          image_url:  product.image_url,
          stock:      product.stock,
          quantity:   1,
        },
      ];
    });
    setIsOpen(true); // auto-open cart drawer when adding — nice feedback
  };

  // updateQuantity — change quantity directly (used by +/- buttons in cart)
  const updateQuantity = (productId, delta) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product_id === productId
            ? { ...i, quantity: Math.max(0, Math.min(i.quantity + delta, i.stock)) }
            : i
        )
        .filter((i) => i.quantity > 0) // remove if quantity hits 0
    );
  };

  // removeItem — remove a product entirely
  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  };

  // clearCart — empty the cart (called after successful order)
  const clearCart = () => setItems([]);

  // Derived values — calculated fresh every render, never stored separately
  // Feynman: like calculating the total at checkout by adding up the receipt,
  // not by keeping a separate "total" sticky note that could go stale.
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const value = {
    items,
    isOpen,
    setIsOpen,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
