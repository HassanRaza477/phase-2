'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../api/client';
import { Task, TaskCreate, TaskUpdate, SortOption } from '@/types';
import toast, { Toaster } from 'react-hot-toast';

import {
  PriorityBadge,
  PrioritySelector,
  TagBadge,
  TagsInput,
  PriorityFilter,
  TagFilter,
  FilterBar,
  SortSelector,
} from '../components/task';

// Icons (customized with theme colors)
const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const CircleIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const EditIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);

const DeleteIcon = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const StatsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

// Loading Skeleton
const TaskSkeleton = () => (
  <div className="bg-white rounded-xl border border-[#DBD0BD] p-5 animate-pulse shadow-sm">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="h-6 w-32 bg-[#DBD0BD] rounded"></div>
          <div className="h-5 w-16 bg-[#DBD0BD] rounded-full"></div>
        </div>
        <div className="h-4 w-48 bg-[#DBD0BD] rounded mt-2"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 w-8 bg-[#DBD0BD] rounded-lg"></div>
        <div className="h-8 w-8 bg-[#DBD0BD] rounded-lg"></div>
        <div className="h-8 w-8 bg-[#DBD0BD] rounded-lg"></div>
      </div>
    </div>
  </div>
);

// Task Modal
interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskCreate) => Promise<void>;
  initialData?: TaskCreate & { tags?: string[] };
  title: string;
  submitText: string;
}

const TaskModal = ({ isOpen, onClose, onSubmit, initialData, title, submitText }: TaskModalProps) => {
  const [formData, setFormData] = useState<TaskCreate & { tags?: string[] }>(
    initialData || { title: '', description: '', priority: 'medium', tags: [] }
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'medium',
        tags: initialData.tags || [],
      });
    } else {
      setFormData({ title: '', description: '', priority: 'medium', tags: [] });
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-20 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#DBD0BD] transform transition-all max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-[#0C5446] mb-4">{title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#0C5446] mb-1">
                Title <span className="text-[#FF6700]">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#FCFAEF] border border-[#DBD0BD] rounded-lg text-[#0C5446] placeholder-[#0C5446]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6700] focus:border-transparent transition-all"
                placeholder="Enter task title"
                required
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#0C5446] mb-1">
                Description <span className="text-[#0C5446]/60">(optional)</span>
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-[#FCFAEF] border border-[#DBD0BD] rounded-lg text-[#0C5446] placeholder-[#0C5446]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6700] focus:border-transparent transition-all"
                placeholder="Add details..."
              />
            </div>
            <PrioritySelector
              label="Priority"
              value={formData.priority || 'medium'}
              onChange={(priority) => setFormData({ ...formData, priority })}
              disabled={submitting}
            />
            <TagsInput
              label="Tags"
              value={formData.tags || []}
              onChange={(tags) => setFormData({ ...formData, tags })}
              disabled={submitting}
              maxTags={10}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#0C5446] bg-[#DBD0BD] rounded-lg hover:bg-[#ccc0aa] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#FF6700] text-white rounded-lg hover:bg-[#e55c00] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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

// Stat Card component
const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
  <div className="bg-white rounded-xl border border-[#DBD0BD] p-6 shadow-sm hover:shadow-md transition">
    <div className="flex items-center gap-4">
      <div className={`p-3 bg-[#FCFAEF] rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-[#0C5446]/60">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  </div>
);

// Task Card component
const TaskCard = ({ task, onToggle, onEdit, onDelete }: {
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}) => {
  const displayedTags = task.tags?.slice(0, 3) || [];
  const remainingTagsCount = (task.tags?.length || 0) - 3;

  return (
    <div className="group bg-white rounded-xl border border-[#DBD0BD] p-5 hover:shadow-lg transition-all hover:border-[#FF6700]/30 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-[#0C5446]/40' : 'text-[#0C5446]'}`}>
              {task.title}
            </h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${task.completed
                ? 'bg-[#DBD0BD] text-[#0C5446]/60'
                : 'bg-[#FF6700]/10 text-[#FF6700]'
                }`}
            >
              {task.completed ? 'Completed' : 'Pending'}
            </span>
            {task.priority && (
              <PriorityBadge priority={task.priority} showLabel={true} />
            )}
          </div>
          {task.description && (
            <p className={`mt-1 text-sm ${task.completed ? 'text-[#0C5446]/40' : 'text-[#0C5446]/70'}`}>
              {task.description}
            </p>
          )}
          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {displayedTags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
              {remainingTagsCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{remainingTagsCount} more
                </span>
              )}
            </div>
          )}
          <p className="text-xs text-[#0C5446]/40 mt-2">
            Created: {new Date(task.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onToggle(task.id)}
            className={`p-2 rounded-lg transition-all ${task.completed
              ? 'bg-[#DBD0BD] text-[#0C5446] hover:bg-[#ccc0aa]'
              : 'bg-[#FF6700]/10 text-[#FF6700] hover:bg-[#FF6700]/20'
              }`}
            title={task.completed ? 'Mark as pending' : 'Mark as completed'}
          >
            {task.completed ? <CheckIcon /> : <CircleIcon />}
          </button>
          <button
            onClick={() => onEdit(task)}
            className="p-2 bg-[#DBD0BD] text-[#0C5446] rounded-lg hover:bg-[#ccc0aa] transition-all"
            title="Edit task"
          >
            <EditIcon />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 bg-[#DBD0BD] text-[#0C5446] rounded-lg hover:bg-[#ccc0aa] transition-all"
            title="Delete task"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

// Empty State Icon
const EmptyStateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#DBD0BD] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Advanced: search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterTag, setFilterTag] = useState('');
  
  // Sort state
  const [sortOption, setSortOption] = useState<SortOption>('created_at');

  // Quick add
  const [quickAddTitle, setQuickAddTitle] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const fetchTasks = useCallback(async () => {
    // Guard: don't fetch if not authenticated
    if (!isAuthenticated) {
      console.warn('[Dashboard] fetchTasks called while not authenticated — skipping');
      setLoading(false);
      return;
    }

    setNetworkError(null);
    setLoading(true);

    try {
      // Build filter params
      const filterParams: {
        priority?: 'high' | 'medium' | 'low';
        tag?: string;
        search?: string;
        status?: 'all' | 'pending' | 'completed';
        sort?: SortOption;
      } = {};

      if (filterPriority !== 'all') {
        filterParams.priority = filterPriority;
      }
      if (filterTag.trim()) {
        filterParams.tag = filterTag.trim();
      }
      if (searchQuery.trim()) {
        filterParams.search = searchQuery.trim();
      }
      if (filterStatus !== 'all') {
        filterParams.status = filterStatus;
      }
      if (sortOption) {
        filterParams.sort = sortOption;
      }

      const data = await tasksAPI.getTasks(filterParams);
      setTasks(data);
      console.log(`[Dashboard] Loaded ${data.length} tasks with filters:`, filterParams);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      const message = errorObj?.message || 'Failed to load tasks. Check your connection and try again.';
      console.error('[Dashboard] fetchTasks error:', {
        message,
        error: err,
      });
      setNetworkError(message);
      // Only show toast if it's not a timeout (too spammy)
      if (!message.includes('timed out')) {
        toast.error(message, { duration: 6000 });
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filterPriority, filterTag, searchQuery, filterStatus, sortOption]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchTasks();
    }
  }, [isAuthenticated, isLoading, fetchTasks]);

  // Sync listener: re-fetch when chatbot makes changes
  useEffect(() => {
    if (!isAuthenticated) return;

    let lastFetch = 0;
    const DEBOUNCE_MS = 2000; // prevent rapid re-fetches

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tasks_updated') {
        const now = Date.now();
        if (now - lastFetch > DEBOUNCE_MS) {
          lastFetch = now;
          console.log('[Dashboard] tasks_updated event — re-fetching');
          fetchTasks();
        }
      }
    };

    // Only re-fetch on focus if user was away for > 30 seconds
    let blurTime = 0;
    const handleBlur = () => { blurTime = Date.now(); };
    const handleFocus = () => {
      if (Date.now() - blurTime > 30000) {
        console.log('[Dashboard] Window focused after 30s — re-fetching');
        fetchTasks();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isAuthenticated, fetchTasks]);

  // Filtered tasks - now using server-side filtering
  // The API returns already filtered data based on filter params
  const filteredTasks = useMemo(() => {
    return tasks;
  }, [tasks]);

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const handleCreateTask = async (data: TaskCreate) => {
    try {
      const newTask = await tasksAPI.createTask(data);
      setTasks(prev => [newTask, ...prev]);
      toast.success('Task created successfully!');
    } catch (err: unknown) {
      console.error('Create task error:', err);
      const errorObj = err as { message?: string };
      const message = errorObj.message || 'Failed to create task';
      toast.error(message);
      throw err;
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTitle.trim()) return;
    try {
      const newTask = await tasksAPI.createTask({ title: quickAddTitle, description: '' });
      setTasks(prev => [newTask, ...prev]);
      setQuickAddTitle('');
      setIsQuickAddOpen(false);
      toast.success('Task added!');
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error(errorObj.message || 'Failed to add task');
    }
  };

  const handleUpdateTask = async (data: TaskCreate & { tags?: string[] }) => {
    if (!editingTask) return;
    try {
      const updatedTask = await tasksAPI.updateTask(editingTask.id, {
        title: data.title,
        description: data.description,
        priority: data.priority,
        tags: data.tags,
      });
      setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));
      toast.success('Task updated successfully!');
    } catch (err: unknown) {
      console.error('Update task error:', err);
      const errorObj = err as { message?: string };
      const message = errorObj.message || 'Failed to update task';
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
    } catch (err: unknown) {
      console.error('Toggle task error:', err);
      const errorObj = err as { message?: string };
      toast.error(errorObj.message || 'Failed to update task');
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
    } catch (err: unknown) {
      console.error('Delete task error:', err);
      const errorObj = err as { message?: string };
      toast.error(errorObj.message || 'Failed to delete task');
      setTasks(originalTasks);
    }
  };

  const handleRetry = () => {
    fetchTasks();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FCFAEF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#0C5446] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAEF] text-[#0C5446]">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#0C5446',
            border: '1px solid #DBD0BD',
          },
        }}
      />

      {/* Header - ab onLogout prop nahi diya, kyunke Header khud useAuth use karta hai */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Title and Create Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-[#0C5446]">Dashboard</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[#FF6700] text-white rounded-lg hover:bg-[#e55c00] transition-all transform hover:scale-105 flex items-center gap-2 shadow-md"
          >
            <PlusIcon />
            New Task
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="Total Tasks"
            value={totalTasks}
            icon={<StatsIcon />}
            color="text-[#0C5446]"
          />
          <StatCard
            title="Completed"
            value={completedTasks}
            icon={<CheckIcon className="w-6 h-6" />}
            color="text-[#FF6700]"
          />
          <StatCard
            title="Pending"
            value={pendingTasks}
            icon={<CircleIcon className="w-6 h-6" />}
            color="text-[#0C5446]"
          />
        </div>

        {/* Search & Filter Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          filterPriority={filterPriority}
          onPriorityChange={setFilterPriority}
          filterTag={filterTag}
          onTagChange={setFilterTag}
          onClearAll={() => {
            setSearchQuery('');
            setFilterStatus('all');
            setFilterPriority('all');
            setFilterTag('');
          }}
          className="mb-6"
        />

        {/* Sort Selector */}
        <div className="mb-6">
          <SortSelector
            value={sortOption}
            onChange={setSortOption}
            id="dashboard-sort-selector"
          />
        </div>

        {/* Quick Add */}
        <div className="mb-6">
          <button
            onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
            className="flex items-center gap-2 text-[#0C5446] hover:text-[#FF6700] transition"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Quick Add Task</span>
          </button>
          {isQuickAddOpen && (
            <form onSubmit={handleQuickAdd} className="mt-3 flex gap-2">
              <input
                type="text"
                value={quickAddTitle}
                onChange={(e) => setQuickAddTitle(e.target.value)}
                placeholder="Enter task title..."
                className="flex-1 px-4 py-2 bg-white border border-[#DBD0BD] rounded-lg text-[#0C5446] placeholder-[#0C5446]/40 focus:outline-none focus:ring-2 focus:ring-[#FF6700]"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#FF6700] text-white rounded-lg hover:bg-[#e55c00] transition"
              >
                Add
              </button>
            </form>
          )}
        </div>

        {/* Network Error Banner */}
        {networkError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <p className="text-sm text-red-600">{networkError}</p>
            <button
              onClick={handleRetry}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
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
          initialData={editingTask ? {
            title: editingTask.title,
            description: editingTask.description,
            priority: editingTask.priority || 'medium',
            tags: editingTask.tags || [],
          } : undefined}
          title="Edit Task"
          submitText="Update Task"
        />

        {/* Tasks List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <TaskSkeleton key={i} />)}
          </div>
        ) : filteredTasks.length === 0 && !networkError ? (
          <div className="bg-white rounded-xl p-12 text-center border border-[#DBD0BD] shadow-sm">
            <EmptyStateIcon />
            <h3 className="text-lg font-medium text-[#0C5446] mb-2">No tasks found</h3>
            <p className="text-[#0C5446]/60 mb-4">
              {searchQuery || filterPriority !== 'all' || filterTag || filterStatus !== 'all'
                ? 'Try adjusting your search or filters, or clear them to see all tasks'
                : 'Get started by creating your first task'}
            </p>
            {(searchQuery || filterPriority !== 'all' || filterTag || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setFilterPriority('all');
                  setFilterTag('');
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className="px-4 py-2 text-sm text-[#FF6700] hover:text-[#e55c00] font-medium transition-colors mb-4"
              >
                Clear all filters
              </button>
            )}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[#FF6700] text-white rounded-lg hover:bg-[#e55c00] inline-flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <PlusIcon />
              Create Task
            </button>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onEdit={setEditingTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}