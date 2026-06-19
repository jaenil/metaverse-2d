import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';
export const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001';

const client = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
});

// Inject token from localStorage on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
