// src/api/client.js
//
// What this file does:
// Creates ONE configured axios instance that the entire app uses.
// Automatically attaches the JWT token to every request.
// Automatically logs the user out if a token expires.
//
// Feynman version:
// Imagine every employee at a company carries an ID badge to enter any door.
// Instead of you manually showing your badge at every single door (every API call),
// this file is like a smart badge-reader built into your clothes — it shows your
// badge automatically wherever you go. You just walk; the badge handles itself.
//
// This is called an "axios interceptor" — code that runs automatically
// BEFORE every request is sent, or AFTER every response is received.

import axios from 'axios';

// Deployed builds call the API through the same host as the storefront.
// The frontend nginx proxy forwards those relative requests to the gateway.
// Local React development keeps using the separately published gateway port.
const rawApiUrl = process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location.port === '3000'
    ? window.location.origin
    : 'http://localhost:8000');

// Ensure the base URL does not end with a trailing slash or duplicate /api.
const API_URL = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/i, '');

// Commenting below to mitigate CORS issues when running frontend and backend on different ports during development.
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

//Testing
// const apiClient = axios.create({
//     baseURL: API_URL,
//     headers: { 
//         'Content-Type': 'application/json' 
//     },
// });

// ── REQUEST INTERCEPTOR ───────────────────────────────────────────────────
// Runs before every single request leaves the browser.
// Reads the token from localStorage and attaches it to the Authorization header.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── RESPONSE INTERCEPTOR ──────────────────────────────────────────────────
// Runs after every response arrives.
// If we get a 401 (Unauthorized), the token is invalid/expired —
// log the user out automatically and send them to login.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('shopflow_token');
      localStorage.removeItem('shopflow_user');
      // Only redirect if we're not already on an auth page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
