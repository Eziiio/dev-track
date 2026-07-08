import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Define Zod validation schema
const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').default(''),
  projectId: z.string().min(1, 'Project selection is required'),
  assignedTo: z.string().nullable().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  status: z.enum(['To Do', 'In Progress', 'Review', 'Done']).default('To Do'),
  dueDate: z.string().nullable().optional(),
  labels: z.string().default('')
});

function TaskModal({ isOpen, onClose, onSubmitSuccess, task = null }) {
  const { user: currentUser, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const isEditMode = !!task;

  // Determine user relationship to the task in Edit Mode
  const isCreator = isEditMode && (task.createdBy?._id === currentUser?._id || task.createdBy === currentUser?._id);
  const isAssignee = isEditMode && (task.assignedTo?._id === currentUser?._id || task.assignedTo === currentUser?._id);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      projectId: '',
      assignedTo: '',
      priority: 'Medium',
      status: 'To Do',
      dueDate: '',
      labels: ''
    }
  });

  const selectedProjectId = watch('projectId');

  // Load project index for project dropdown
  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen]);

  // Load/Reset fields when modal opens
  useEffect(() => {
    if (isOpen) {
      if (task) {
        reset({
          title: task.title,
          description: task.description || '',
          projectId: task.projectId?._id || task.projectId,
          assignedTo: task.assignedTo?._id || task.assignedTo || '',
          priority: task.priority || 'Medium',
          status: task.status || 'To Do',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().substring(0, 10) : '',
          labels: task.labels ? task.labels.join(', ') : ''
        });
      } else {
        reset({
          title: '',
          description: '',
          projectId: '',
          assignedTo: '',
          priority: 'Medium',
          status: 'To Do',
          dueDate: '',
          labels: ''
        });
      }
    }
  }, [isOpen, task, reset]);

  // Load project members based on selected project
  useEffect(() => {
    if (selectedProjectId) {
      const proj = projects.find((p) => p._id === selectedProjectId);
      if (proj) {
        setProjectMembers(proj.members || []);
      } else {
        // Fallback: fetch project individually
        projectService.getProject(selectedProjectId)
          .then((res) => {
            if (res.success && res.data.project) {
              setProjectMembers(res.data.project.members || []);
            }
          })
          .catch((err) => console.error('Failed to fetch project members:', err));
      }
    } else {
      setProjectMembers([]);
    }
  }, [selectedProjectId, projects]);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await projectService.getProjects({ limit: 100 });
      if (res.success) {
        setProjects(res.data.projects || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load project lists');
    } finally {
      setLoadingProjects(false);
    }
  };

  const onSubmit = async (formData) => {
    try {
      // Process labels string into array of strings
      const labelsArray = formData.labels
        ? formData.labels.split(',').map((l) => l.trim()).filter(Boolean)
        : [];

      const payload = {
        title: formData.title,
        description: formData.description,
        projectId: formData.projectId,
        assignedTo: formData.assignedTo || null,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate || null,
        labels: labelsArray
      };

      let res;
      if (isEditMode) {
        // Members cannot update assignedTo, and project cannot be changed
        // Filter out fields they cannot submit to avoid Mongoose validation/auth errors
        const editPayload = { ...payload };
        if (!isAdmin) {
          delete editPayload.assignedTo;
          delete editPayload.projectId;

          // If standard Member is only assignee and not creator, lock all fields except status
          if (isAssignee && !isCreator) {
            // Keep only status in update payload
            Object.keys(editPayload).forEach((key) => {
              if (key !== 'status') delete editPayload[key];
            });
          }
        }
        res = await taskService.updateTask(task._id, editPayload);
      } else {
        res = await taskService.createTask(payload);
      }

      if (res.success) {
        toast.success(isEditMode ? 'Task updated successfully!' : 'Task created successfully!');
        onSubmitSuccess();
        onClose();
      }
    } catch (error) {
      const apiErrorMsg = error.response?.data?.message || error.message || 'Action failed';
      toast.error(apiErrorMsg);
    }
  };

  if (!isOpen) return null;

  // UI field locking logic
  const isProjectDisabled = isEditMode || loadingProjects;
  const isTitleDisabled = isEditMode && !isAdmin && !isCreator;
  const isDescriptionDisabled = isEditMode && !isAdmin && !isCreator;
  const isPriorityDisabled = isEditMode && !isAdmin && !isCreator;
  const isDueDateDisabled = isEditMode && !isAdmin && !isCreator;
  const isLabelsDisabled = isEditMode && !isAdmin && !isCreator;
  const isStatusDisabled = false; // Always editable by assignee, creator, and admin
  const isAssigneeDisabled = !isAdmin; // Only Admin can assign tasks

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full flex flex-col max-h-[90vh] shadow-xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <h3 className="font-display text-lg font-bold text-slate-850 dark:text-white">
            {isEditMode ? 'Edit Task Details' : 'Create New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-250 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Associated Project */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="projectId">
              Associated Project
            </label>
            <select
              id="projectId"
              disabled={isProjectDisabled}
              {...register('projectId')}
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl outline-none transition-all duration-200 text-sm font-medium ${
                errors.projectId
                  ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="text-xs font-semibold text-rose-500 mt-1">{errors.projectId.message}</p>
            )}
          </div>

          {/* Task Title */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="title">
              Task Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Implement API Gateway"
              disabled={isSubmitting || isTitleDisabled}
              {...register('title')}
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl outline-none transition-all duration-200 text-sm font-medium ${
                errors.title
                  ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            />
            {errors.title && (
              <p className="text-xs font-semibold text-rose-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Add detailed task requirements..."
              disabled={isSubmitting || isDescriptionDisabled}
              rows={3}
              {...register('description')}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-sm font-medium resize-none disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Dual Row: Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                disabled={isSubmitting || isStatusDisabled}
                {...register('status')}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="priority">
                Priority
              </label>
              <select
                id="priority"
                disabled={isSubmitting || isPriorityDisabled}
                {...register('priority')}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Dual Row: Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assignee (Admin only can edit) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="assignedTo">
                Assignee
              </label>
              <select
                id="assignedTo"
                disabled={isSubmitting || isAssigneeDisabled}
                {...register('assignedTo')}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Unassigned</option>
                {projectMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
              {!isAdmin && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5">
                  Only administrators can assign tasks.
                </p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="dueDate">
                Due Date
              </label>
              <input
                id="dueDate"
                type="date"
                disabled={isSubmitting || isDueDateDisabled}
                {...register('dueDate')}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="labels">
              Labels
            </label>
            <input
              id="labels"
              type="text"
              placeholder="e.g. bug, frontend, enhancement (comma separated)"
              disabled={isSubmitting || isLabelsDisabled}
              {...register('labels')}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold text-sm cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-semibold text-sm cursor-pointer shadow-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </>
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskModal;
