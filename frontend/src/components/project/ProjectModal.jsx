import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import projectService from '../../services/projectService';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { X, Search, User, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Define Zod validation schema
const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').default('')
});

function ProjectModal({ isOpen, onClose, onSubmitSuccess, project = null }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  const isEditMode = !!project;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: ''
    }
  });

  // Load user list for collaborator selector
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Load fields when modal opens for editing
  useEffect(() => {
    if (isOpen) {
      if (project) {
        reset({
          title: project.title,
          description: project.description || ''
        });
        setSelectedMembers(project.members?.map((m) => m._id) || []);
      } else {
        reset({
          title: '',
          description: ''
        });
        // Default include current user in creation
        setSelectedMembers([currentUser?._id]);
      }
      setSearchQuery('');
    }
  }, [isOpen, project, reset, currentUser]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await userService.getUsers();
      if (res.success) {
        // Exclude current user from picker list since they are locked/always included
        setUsers(res.data.users || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load user directories');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleMemberToggle = (userId) => {
    // Locked: Cannot remove the project creator (if edit mode, project.createdBy; if create mode, current user)
    const creatorId = isEditMode ? (project.createdBy?._id || project.createdBy) : currentUser?._id;
    if (userId === creatorId) {
      toast.error('Project creator is a locked member');
      return;
    }

    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const onSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        members: selectedMembers
      };

      let res;
      if (isEditMode) {
        res = await projectService.updateProject(project._id, payload);
      } else {
        res = await projectService.createProject(payload);
      }

      if (res.success) {
        toast.success(isEditMode ? 'Project updated successfully!' : 'Project created successfully!');
        onSubmitSuccess();
        onClose();
      }
    } catch (error) {
      const apiErrorMsg = error.response?.data?.message || error.message || 'Action failed';
      toast.error(apiErrorMsg);
    }
  };

  if (!isOpen) return null;

  // Filter users by search query
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const creatorId = isEditMode ? (project.createdBy?._id || project.createdBy) : currentUser?._id;

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full flex flex-col max-h-[90vh] shadow-xl animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <h3 className="font-display text-lg font-bold text-slate-850 dark:text-white">
            {isEditMode ? 'Edit Project Settings' : 'Create New Project'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-250 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300" htmlFor="title">
              Project Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Website Redesign"
              disabled={isSubmitting}
              {...register('title')}
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 text-white border rounded-xl outline-none transition-all duration-200 text-sm font-medium ${errors.title
                ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-200 dark:border-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                }`}
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
              placeholder="Brief description about project objectives..."
              disabled={isSubmitting}
              rows={3}
              {...register('description')}
              className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 text-white border rounded-xl outline-none transition-all duration-200 text-sm font-medium resize-none ${errors.description
                ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-200 dark:border-slate-800 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                }`}
            />
            {errors.description && (
              <p className="text-xs font-semibold text-rose-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Collaborator Picker */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Invite Collaborators
            </label>

            {/* Selected Pills */}
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl min-h-[46px]">
              {selectedMembers.length === 0 ? (
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium self-center pl-2">
                  No members added yet
                </span>
              ) : (
                selectedMembers.map((memberId) => {
                  const mUser = users.find((u) => u._id === memberId) || (memberId === currentUser?._id ? currentUser : null);
                  if (!mUser) return null;
                  const isCreator = memberId === creatorId;
                  return (
                    <span
                      key={memberId}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${isCreator
                        ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border-primary-200/50 dark:border-primary-800/50'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800/80 shadow-sm'
                        }`}
                    >
                      {mUser.name}
                      {isCreator && <span className="text-[10px] opacity-75">(Creator)</span>}
                      {!isCreator && !isSubmitting && (
                        <button
                          type="button"
                          onClick={() => handleMemberToggle(memberId)}
                          className="text-slate-400 hover:text-rose-500 transition-colors ml-0.5"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  );
                })
              )}
            </div>

            {/* Search list */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-44 bg-white dark:bg-slate-950">
              <div className="h-10 border-b border-slate-100 dark:border-slate-800 flex items-center px-3 gap-2 shrink-0">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-xs font-semibold text-slate-700 dark:text-slate-300"
                />
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-900/60">
                {loadingUsers ? (
                  <div className="flex items-center justify-center h-full gap-2 text-xs text-slate-400">
                    <Loader2 className="animate-spin" size={14} />
                    Loading user index...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400">
                    No users match your query
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelected = selectedMembers.includes(u._id);
                    const isCreator = u._id === creatorId;
                    return (
                      <button
                        key={u._id}
                        type="button"
                        onClick={() => handleMemberToggle(u._id)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/60 text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold flex items-center justify-center text-xs shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 text-xs">
                            <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                              {u.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <Check size={14} className="text-primary-600 dark:text-primary-400 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
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
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectModal;
