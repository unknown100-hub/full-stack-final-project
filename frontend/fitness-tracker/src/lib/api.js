import axios from 'axios';

const envBase = import.meta.env?.VITE_API_BASE?.trim();
// Default to local backend during dev; fall back to relative /api in prod-like builds
const baseURL = envBase || (import.meta.env?.DEV ? 'http://localhost:5000/api' : '/api');

// Axios instance with base URL, short timeout, and auth header
const api = axios.create({
  baseURL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
