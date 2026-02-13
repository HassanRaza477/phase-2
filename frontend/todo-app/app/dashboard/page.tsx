'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../api/client';
import { Task, TaskCreate, TaskUpdate } from '@/types';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../components/Header';

// Icons
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const CircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const EmptyStateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

// Loading Skeleton
const TaskSkeleton = () => (
  <div className="bg-gray-900 rounded-lg border border-gray-800 p-5 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="h-6 w-32 bg-gray-800 rounded"></div>
          <div className="h-5 w-16 bg-gray-800 rounded-full"></div>
        </div>
        <div className="h-4 w-48 bg-gray-800 rounded mt-2"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-gray-800 rounded-lg"></div>
        <div className="h-8 w-8 bg-gray-800 rounded-lg"></div>
        <div className="h-8 w-8 bg-gray-800 rounded-lg"></div>
      </div>
    </div>
  </div>
);

// Task Modal for Create/Edit
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskCreate) => Promise<void>;
  initialData?: TaskCreate;
  title: string;
  submitText: string;
}

const TaskModal = ({ isOpen, onClose, onSubmit, initialData, title, submitText }: TaskModalProps) => {
  const [formData, setFormData] = useState<TaskCreate>(initialData || { title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ title: '', description: '' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handled by caller
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-20">
      <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-800 transform transition-all">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
                placeholder="Enter task title"
                required
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Description <span className="text-gray-500">(optional)</span>
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-white focus:border-white transition-all"
                placeholder="Add details..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                submitText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated]);

  const fetchTasks = async () => {
    setNetworkError(null);
    try {
      setLoading(true);
      const data = await tasksAPI.getTasks();
      setTasks(data);
    } catch (err: any) {
      console.error('Fetch tasks error:', err);
      const message = err.message || 'Failed to load tasks';
      setNetworkError(message);
      toast.error(message, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (data: TaskCreate) => {
    try {
      const newTask = await tasksAPI.createTask(data);
      setTasks(prev => [newTask, ...prev]);
      toast.success('Task created successfully!');
    } catch (err: any) {
      console.error('Create task error:', err);
      const message = err.message || 'Failed to create task';
      toast.error(message);
      throw err; // Re-throw so modal knows it failed
    }
  };

  const handleUpdateTask = async (data: TaskCreate) => {
    if (!editingTask) return;
    try {
      const updatedTask = await tasksAPI.updateTask(editingTask.id, data);
      setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));
      toast.success('Task updated successfully!');
    } catch (err: any) {
      console.error('Update task error:', err);
      const message = err.message || 'Failed to update task';
      toast.error(message);
      throw err;
    } finally {
      setEditingTask(null);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    const originalTasks = [...tasks];
    const taskToToggle = tasks.find(t => t.id === taskId);
    if (!taskToToggle) return;

    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    );

    try {
      await tasksAPI.toggleTask(taskId);
      toast.success(taskToToggle.completed ? 'Task marked pending' : 'Task completed!');
    } catch (err: any) {
      console.error('Toggle task error:', err);
      toast.error(err.message || 'Failed to update task');
      setTasks(originalTasks);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const originalTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      await tasksAPI.deleteTask(taskId);
      toast.success('Task deleted');
    } catch (err: any) {
      console.error('Delete task error:', err);
      toast.error(err.message || 'Failed to delete task');
      setTasks(originalTasks);
    }
  };

  const handleRetry = () => {
    fetchTasks();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f1f1f',
            color: '#fff',
            border: '1px solid #333',
          },
        }}
      />

      <Header onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Your Tasks</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg"
          >
            <PlusIcon />
            New Task
          </button>
        </div>

        {/* Network Error Banner */}
        {networkError && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center justify-between backdrop-blur-sm">
            <p className="text-sm text-red-400">{networkError}</p>
            <button
              onClick={handleRetry}
              className="px-3 py-1 text-xs bg-red-800 text-white rounded hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Create Task Modal */}
        <TaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTask}
          title="Create New Task"
          submitText="Create Task"
        />

        {/* Edit Task Modal */}
        <TaskModal
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onSubmit={handleUpdateTask}
          initialData={editingTask ? { title: editingTask.title, description: editingTask.description } : undefined}
          title="Edit Task"
          submitText="Update Task"
        />

        {/* Tasks List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <TaskSkeleton key={i} />)}
          </div>
        ) : tasks.length === 0 && !networkError ? (
          <div className="bg-gray-900 rounded-lg p-12 text-center border border-gray-800 shadow-xl">
            <EmptyStateIcon />
            <h3 className="text-lg font-medium text-white mb-2">No tasks yet</h3>
            <p className="text-gray-400 mb-4">Get started by creating your first task</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 inline-flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <PlusIcon />
              Create Task
            </button>
          </div>
        ) : tasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-900 rounded-lg border border-gray-800 p-5 hover:border-gray-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          task.completed
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    {task.description && (
                      <p className={`mt-1 text-sm ${task.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                        {task.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-2">
                      Created: {new Date(task.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className={`p-2 rounded-lg transition-all ${
                        task.completed
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                      title={task.completed ? 'Mark as pending' : 'Mark as completed'}
                    >
                      {task.completed ? <CheckIcon /> : <CircleIcon />}
                    </button>
                    <button
                      onClick={() => setEditingTask(task)}
                      className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all"
                      title="Edit task"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-all"
                      title="Delete task"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}