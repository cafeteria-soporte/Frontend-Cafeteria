// src/api/base.service.js
import axios from 'axios';

// 1. Configuramos la instancia global de Axios
export const apiClient = axios.create({
  // Usamos variables de entorno de Vite para la URL de la API
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// (Opcional pero recomendado) Interceptor para inyectar el token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // O de donde guardes tu sesión
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Creamos la clase genérica para el CRUD
export class BaseService {
  constructor(endpoint) {
    // ej: '/products' o '/users'
    this.endpoint = endpoint; 
  }

  // GET: Obtener todos (soporta query params para paginación o filtros)
  async getAll(params = {}) {
    const response = await apiClient.get(this.endpoint, { params });
    return response.data;
  }

  // GET: Obtener por ID
  async getById(id) {
    const response = await apiClient.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  // POST: Crear nuevo registro
  async create(data) {
    const response = await apiClient.post(this.endpoint, data);
    return response.data;
  }

  // PUT: Actualizar registro (puedes cambiarlo a patch si tu backend lo requiere)
  async update(id, data) {
    const response = await apiClient.put(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  // DELETE: Eliminar registro
  async delete(id) {
    const response = await apiClient.delete(`${this.endpoint}/${id}`);
    return response.data;
  }
}