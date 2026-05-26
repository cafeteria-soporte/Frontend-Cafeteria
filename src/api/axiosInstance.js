import axios from 'axios';

const API_BASE_URL = 'https://cafeteria-server-udc9.onrender.com/api/cafeteria';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de solicitud: añade el token automáticamente
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta: maneja errores globales
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si es error 401, limpiar localStorage y redirigir a login (opcional)
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
