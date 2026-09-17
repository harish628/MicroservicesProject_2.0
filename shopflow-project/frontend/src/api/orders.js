// src/api/orders.js — All API calls related to orders and payments

import apiClient from './client';

export const ordersApi = {
  create: (data) =>
    apiClient.post('/api/orders', data).then(res => res.data),

  getMyOrders: () =>
    apiClient.get('/api/orders/my-orders').then(res => res.data),

  getById: (id) =>
    apiClient.get(`/api/orders/${id}`).then(res => res.data),

  cancel: (id) =>
    apiClient.put(`/api/orders/${id}/cancel`).then(res => res.data),
};

export const paymentsApi = {
  process: (data) =>
    apiClient.post('/api/payments', data).then(res => res.data),
};
