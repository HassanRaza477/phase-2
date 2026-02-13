// api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse, UserCreate, UserLogin, Task, TaskCreate, TaskUpdate } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log error for debugging
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Server not responding.'));
    }

    // Network error (server down)
    if (!error.response) {
      return Promise.reject(new Error('Cannot connect to server. Please ensure backend is running.'));
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Handle 403
    if (error.response.status === 403) {
      return Promise.reject(new Error('You do not have permission to perform this action.'));
    }

    // Handle 404
    if (error.response.status === 404) {
      return Promise.reject(new Error('Resource not found. Please check the URL.'));
    }

    // Handle 500
    if (error.response.status >= 500) {
      return Promise.reject(new Error('Server error. Please try again later.'));
    }

    // Extract message from response
    const responseData = error.response.data as any;
    let message = 'An error occurred.';
    if (responseData?.detail) message = responseData.detail;
    else if (responseData?.message) message = responseData.message;
    else if (typeof responseData === 'string') message = responseData;
    else message = `HTTP ${error.response.status}: ${error.response.statusText}`;

    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authAPI = {
  register: (data: UserCreate) => apiClient.post<AuthResponse>('/api/register', data).then(res => res.data),
  login: (data: UserLogin) => apiClient.post<AuthResponse>('/api/login', data).then(res => res.data),
};

// Tasks API
export const tasksAPI = {
  getTasks: () => apiClient.get<Task[]>('/api/tasks').then(res => res.data.map(task => ({
    ...task,
    description: task.description ?? undefined
  }))),
  createTask: (data: TaskCreate) => apiClient.post<Task>('/api/tasks', data).then(res => ({
    ...res.data,
    description: res.data.description ?? undefined
  })),
  updateTask: (id: number, data: TaskUpdate) => apiClient.put<Task>(`/api/tasks/${id}`, data).then(res => ({
    ...res.data,
    description: res.data.description ?? undefined
  })),
  deleteTask: (id: number) => apiClient.delete(`/api/tasks/${id}`),
  toggleTask: (id: number) => apiClient.patch<Task>(`/api/tasks/${id}/toggle`).then(res => ({
    ...res.data,
    description: res.data.description ?? undefined
  })),
};

export default apiClient;