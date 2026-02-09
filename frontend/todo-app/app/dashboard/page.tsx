'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { tasksAPI } from '../api/client';
import { Task, TaskCreate, TaskUpdate } from '@/types';

export default function DashboardPage() {
  const { logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tasksAPI.getTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (data: TaskCreate) => {
    try {
      setIsSubmitting(true);
      const newTask = await tasksAPI.createTask(data);
      setTasks([newTask, ...tasks]);
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (data: TaskCreate) => {
    if (!editingTask) return;

    try {
      setIsSubmitting(true);
      const updateData: TaskUpdate = {
        title: data.title,
        description: data.description,
        completed: editingTask.completed,
      };
      const updatedTask = await tasksAPI.updateTask(editingTask.id, updateData);
      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
      setEditingTask(null);
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (id: number) => {
    try {
      const updatedTask = await tasksAPI.toggleTask(id);
      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to toggle task');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await tasksAPI.deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete task');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">My Tasks</h1>
              </div>
              <div className="flex items-center">
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    New Task
                  </button>
                )}
              </div>

              {showForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </h3>
                  <TaskForm
                    task={editingTask || undefined}
                    onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                    onCancel={handleCancelForm}
                    isLoading={isSubmitting}
                  />
                </div>
              )}

              <TaskList
                tasks={tasks}
                onToggle={handleToggleTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                isLoading={isLoading}
                error={error}
              />
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}