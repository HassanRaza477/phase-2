export interface User {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
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
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  completed?: boolean;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  completed?: boolean;
}

/**
 * SortOption - Available sort options for task list
 * - due_date: Sort by due date (earliest first, nulls last)
 * - priority: Sort by priority (high → medium → low)
 * - alphabetical: Sort by title (A-Z)
 * - created_at: Sort by creation date (newest first)
 */
export type SortOption = 'due_date' | 'priority' | 'alphabetical' | 'created_at';