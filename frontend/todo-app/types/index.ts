export interface User {
  id: number;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface UserCreate {
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}