import axios from 'axios';
import { mockAdapter } from './mockServer';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  ...(useMock ? { adapter: mockAdapter } : {}),
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ju_access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/login') &&
      !originalRequest?.url?.includes('/auth/token/refresh')
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('ju_refresh_token');
      if (refreshToken) {
        try {
          const res = await apiClient.post('/auth/token/refresh/', {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem('ju_access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('ju_access_token');
          localStorage.removeItem('ju_refresh_token');
          localStorage.removeItem('ju_user');
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
