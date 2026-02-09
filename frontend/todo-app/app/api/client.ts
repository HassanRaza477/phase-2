import axios from 'axios';
import { AuthResponse, UserCreate, UserLogin, Task, TaskCreate, TaskUpdate } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config: { headers: { Authorization: string; }; }) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (data: UserCreate): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  
  login: async (data: UserLogin): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getTasks: async (): Promise<Task[]> => {
    const response = await apiClient.get('/tasks/');
    return response.data;
  },
  
  getTask: async (id: number): Promise<Task> => {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },
  
  createTask: async (data: TaskCreate): Promise<Task> => {
    const response = await apiClient.post('/tasks/', data);
    return response.data;
  },
  
  updateTask: async (id: number, data: TaskUpdate): Promise<Task> => {
    const response = await apiClient.put(`/tasks/${id}`, data);
    return response.data;
  },
  
  deleteTask: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
  
  toggleTask: async (id: number): Promise<Task> => {
    const response = await apiClient.patch(`/tasks/${id}/toggle`);
    return response.data;
  },
};

export default apiClient;