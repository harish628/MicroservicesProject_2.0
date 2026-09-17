// src/api/products.js
//
// All API calls related to products and categories.
// Every function here goes through the Gateway, which forwards to Product Service.

import apiClient from './client';

export const productsApi = {
  // Get paginated products, with optional search and category filter
  getAll: (params = {}) =>
    apiClient.get('/api/products', { params }).then(res => res.data),

  // Get a single product by ID
  getById: (id) =>
    apiClient.get(`/api/products/${id}`).then(res => res.data),

  // Get all categories
  getCategories: () =>
    apiClient.get('/api/categories').then(res => res.data),
};
