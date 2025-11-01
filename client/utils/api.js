import axios from 'axios';
import { storage } from './storage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://real-time-quiz-battle-pavakie.onrender.com/api',
});

// Log API base URL for debugging
console.log('API Base URL:', api.defaults.baseURL);

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };
