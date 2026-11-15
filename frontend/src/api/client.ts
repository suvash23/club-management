import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('club_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle unauthorized / token expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto logout on login endpoint error
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('club_token');
        localStorage.removeItem('club_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
