import React, { useState, useEffect } from 'react';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import TaskModal from '../components/task/TaskModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  CheckSquare,
  Plus,
  Search,
  User,
  Calendar,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  AlertTriangle,
  Clock,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

function Tasks() {
  const { user: currentUser, isAdmin } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting States
  const [search, setSearch] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt:desc');
  
  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const limit = 6;

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [page, search, projectId, status, priority, assignedTo, sortBy]);

  const fetchProjects = async () => {
    try {
      const res = await projectService.getProjects({ limit: 100 });
      if (res.success) setProjects(res.data.projects || []);
    } catch (err) {
      console.error('Projects fetch error:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await userService.getUsers();
      if (res.success) setUsers(res.data.users || []);
    } catch (err) {
      console.error('Users fetch error:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getTasks({
        search,
        projectId,
        status,
        priority,
        assignedTo,
        sortBy,
        page,
        limit
      });
      if (res.success) {
        setTasks(res.data.tasks || []);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalTasks(res.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const openCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (taskId) => {
    setDeletingId(taskId);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await taskService.deleteTask(deletingId);
      if (res.success) {
        toast.success('Task deleted successfully!');
        setIsConfirmOpen(false);
        setDeletingId(null);
        const isLastItemOnPage = tasks.length === 1 && page > 1;
        setPage(isLastItemOnPage ? page - 1 : page);
        fetchTasks();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate, taskStatus) => {
    if (!dueDate || taskStatus === 'Done') return false;
    return new Date(dueDate) < new Date().setHours(0, 0, 0, 0);
  };

  // Determine current active assignee list for filter
  const currentProjectObj = projects.find((p) => p._id === projectId);
  const activeAssigneeList = currentProjectObj ? currentProjectObj.members || [] : users;

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search bar */}
          <div className="relative max-w-md w-full shrink-0">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={handleFilterChange(setSearch)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm font-semibold transition-all duration-200 text-slate-700 dark:text-slate-350"
            />
          </div>

          {/* Action buttons */}
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-semibold py-2.5 px-4 rounded-xl shadow-md transition-colors cursor-pointer text-sm shrink-0"
          >
            <Plus size={18} />
            Create Task
          </button>
        </div>

        {/* Filter selectors row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {/* Project */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project</label>
            <select
              value={projectId}
              onChange={handleFilterChange(setProjectId)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold outline-none focus:border-primary-500 text-slate-600 dark:text-slate-300"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
            <select
              value={status}
              onChange={handleFilterChange(setStatus)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold outline-none focus:border-primary-500 text-slate-600 dark:text-slate-300"
            >
              <option value="">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</label>
            <select
              value={priority}
              onChange={handleFilterChange(setPriority)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold outline-none focus:border-primary-500 text-slate-600 dark:text-slate-300"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Assignee */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignee</label>
            <select
              value={assignedTo}
              onChange={handleFilterChange(setAssignedTo)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold outline-none focus:border-primary-500 text-slate-600 dark:text-slate-300"
            >
              <option value="">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {activeAssigneeList.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-semibold outline-none focus:border-primary-500 text-slate-600 dark:text-slate-300"
            >
              <option value="createdAt:desc">Created (Newest)</option>
              <option value="createdAt:asc">Created (Oldest)</option>
              <option value="dueDate:asc">Due Date (Soonest)</option>
              <option value="dueDate:desc">Due Date (Latest)</option>
              <option value="title:asc">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Grid list or Empty State */}
      {loading ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="h-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4" />
          ))}
        </section>
      ) : tasks.length === 0 ? (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm mt-8 animate-in fade-in duration-200">
          <div className="bg-slate-50 dark:bg-slate-950 text-slate-350 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-800/40">
            <CheckSquare size={32} />
          </div>
          <h3 className="font-display text-xl font-bold">No Tasks Found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
            {search || projectId || status || priority || assignedTo
              ? "We couldn't find any tasks matching your filters."
              : 'There are no tasks assigned in this project workspace yet.'}
          </p>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => {
              const overdue = isOverdue(task.dueDate, task.status);
              const isCreator = task.createdBy?._id === currentUser?._id || task.createdBy === currentUser?._id;
              const isAssigned = task.assignedTo?._id === currentUser?._id || task.assignedTo === currentUser?._id;
              const editable = isAdmin || isCreator || isAssigned;

              // Priority style mapper
              const priorityClass =
                task.priority === 'High'
                  ? 'text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50'
                  : task.priority === 'Medium'
                  ? 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
                  : 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50';

              // Status style mapper
              const statusClass =
                task.status === 'Done'
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                  : task.status === 'Review'
                  ? 'text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/50'
                  : task.status === 'In Progress'
                  ? 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50'
                  : 'text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700';

              return (
                <div
                  key={task._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between h-[210px]"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      {/* Project Tag */}
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                        <FolderKanban size={12} className="shrink-0" />
                        {task.projectId?.title || 'General'}
                      </span>

                      {/* Action buttons */}
                      <div className="flex gap-0.5 shrink-0">
                        {editable && (
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-1 rounded text-slate-400 hover:text-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                            title="Edit task"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => openDeleteConfirm(task._id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Task Title */}
                    <h4 className="font-display font-bold text-slate-800 dark:text-white truncate text-sm sm:text-base">
                      {task.title}
                    </h4>

                    {/* Excerpt */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {task.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Footer Stats/Avatars */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Priority */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityClass}`}>
                        {task.priority}
                      </span>
                      {/* Status */}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusClass}`}>
                        {task.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Due Date Indicator */}
                      {task.dueDate && (
                        <span
                          className={`flex items-center gap-1 text-[10px] font-semibold ${
                            overdue
                              ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900/50'
                              : 'text-slate-400 dark:text-slate-550'
                          }`}
                          title={overdue ? 'Task is overdue!' : 'Due date'}
                        >
                          {overdue ? <Clock size={11} className="animate-pulse" /> : <Calendar size={11} />}
                          {formatDate(task.dueDate)}
                        </span>
                      )}

                      {/* Assignee Avatar */}
                      <div
                        className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-350 border border-slate-100 dark:border-slate-800 font-bold flex items-center justify-center text-[9px] uppercase"
                        title={task.assignedTo ? `Assigned to ${task.assignedTo.name}` : 'Unassigned'}
                      >
                        {task.assignedTo ? task.assignedTo.name.charAt(0) : <User size={10} />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <footer className="flex items-center justify-center gap-4 pt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </footer>
          )}
        </>
      )}

      {/* Task Creation/Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={fetchTasks}
        task={selectedTask}
      />

      {/* Delete Confirmation Warning */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Task?"
        message="Warning: Deleting this task will permanently remove it and logged activities associated with it. This action is irreversible."
        confirmText="Yes, Delete Task"
        isSubmitting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setDeletingId(null);
        }}
      />
    </div>
  );
}

export default Tasks;
