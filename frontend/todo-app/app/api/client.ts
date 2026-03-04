// app/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { UserCreate, UserLogin, Task, TaskCreate, TaskUpdate } from '@/types';

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
    const extractMessage = (data: unknown): string => {
      if (!data) return 'Server error';
      if (typeof data === 'string') return data;
      
      const dataObj = data as Record<string, unknown>;
      if (dataObj.message && typeof dataObj.message === 'string') return dataObj.message;
      if (dataObj.detail) {
        if (typeof dataObj.detail === 'string') return dataObj.detail;
        if (typeof dataObj.detail === 'object' && dataObj.detail !== null) {
          const detailObj = dataObj.detail as Record<string, unknown>;
          return (detailObj.message as string) || JSON.stringify(dataObj.detail);
        }
      }
      if (dataObj.error && typeof dataObj.error === 'object' && dataObj.error !== null) {
        const errorObj = dataObj.error as Record<string, unknown>;
        return (errorObj.message as string) || JSON.stringify(dataObj.error);
      }
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