// app/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthResponse, UserCreate, UserLogin, Task, TaskCreate, TaskUpdate } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

console.log('[API Client] Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
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

// ─── Response Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // If our backend returns the standardized format, unwrap it for the rest of the app
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      console.log(`[API] unwrapping:`, response.config.url);
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error: AxiosError) => {
    const extractMessage = (data: any): string => {
      if (!data) return 'Server error';
      if (typeof data === 'string') return data;
      if (data.message) return data.message;
      if (data.detail) {
        if (typeof data.detail === 'string') return data.detail;
        if (typeof data.detail === 'object') return data.detail.message || JSON.stringify(data.detail);
      }
      if (data.error && typeof data.error === 'object') return data.error.message || JSON.stringify(data.error);
      return JSON.stringify(data);
    };

    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      return Promise.reject(new Error('Connection failed. Is the backend running?'));
    }

    if (error.response) {
      const { status, data } = error.response;
      const message = extractMessage(data);

      if (status === 401) {
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(new Error(message || 'Session expired'));
      }

      return Promise.reject(new Error(message || `Error ${status}`));
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: UserCreate) =>
    apiClient.post('/api/register', data).then(res => res.data),
  login: (data: UserLogin) =>
    apiClient.post('/api/login', data).then(res => res.data),
};

// ─── Tasks API ────────────────────────────────────────────────────────────────
export const tasksAPI = {
  getTasks: async (): Promise<Task[]> => {
    const res = await apiClient.get<Task[]>('/api/tasks');
    return res.data;
  },

  createTask: async (data: TaskCreate): Promise<Task> => {
    const res = await apiClient.post<Task>('/api/tasks', data);
    return res.data;
  },

  updateTask: async (id: number, data: TaskUpdate): Promise<Task> => {
    const res = await apiClient.put<Task>(`/api/tasks/${id}`, data);
    return res.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/tasks/${id}`);
  },

  toggleTask: async (id: number): Promise<Task> => {
    const res = await apiClient.patch<Task>(`/api/tasks/${id}/toggle`);
    return res.data;
  },
};

export default apiClient;