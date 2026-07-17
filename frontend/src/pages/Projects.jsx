import React, { useState, useEffect } from 'react';
import projectService from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import ProjectModal from '../components/project/ProjectModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  FolderKanban,
  Plus,
  Search,
  User,
  Calendar,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

function Projects() {
  const { isAdmin } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination States
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const limit = 6; // Display 6 projects per page

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [page, search]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjects({
        search,
        page,
        limit
      });
      if (res.success) {
        setProjects(res.data.projects || []);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalProjects(res.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset page to 1 on search change
  };

  const openCreateModal = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (projectId) => {
    setDeletingId(projectId);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await projectService.deleteProject(deletingId);
      if (res.success) {
        toast.success('Project and associated tasks deleted!');
        setIsConfirmOpen(false);
        setDeletingId(null);
        // Refresh page (if last project on page is deleted, slide page back)
        const isLastItemOnPage = projects.length === 1 && page > 1;
        setPage(isLastItemOnPage ? page - 1 : page);
        fetchProjects();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

  // Date formatting helper
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">

      {/* 1. Header controls (Search & Create Action) */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search projects by title..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-sm font-semibold shadow-sm shadow-slate-50/50 dark:shadow-none"
          />
        </div>

        {/* Create Button (Admins only) */}
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-semibold py-2.5 px-4 rounded-xl shadow-md transition-colors cursor-pointer shrink-0 text-sm"
          >
            <Plus size={18} />
            Create Project
          </button>
        )}
      </section>

      {/* 2. Grid contents list */}
      {loading ? (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="h-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4" />
          ))}
        </section>
      ) : projects.length === 0 ? (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm mt-8">
          <div className="bg-slate-50 dark:bg-slate-950 text-slate-350 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 dark:border-slate-800/40">
            <FolderKanban size={32} />
          </div>
          <h3 className="font-display text-xl font-bold">No Projects Found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
            {search
              ? "We couldn't find any projects matching your search filter."
              : 'There are no projects assigned in your workspace. Start by creating a project.'}
          </p>
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white dark:bg-slate-900 border text-white border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between h-[230px]"
              >
                {/* Header card info */}
                <div className="space-y-2 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-display font-bold text-slate-800 dark:text-white truncate text-base sm:text-lg">
                      {project.title}
                    </h3>

                    {/* Admin modifiers */}
                    {isAdmin && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(project)}
                          className="p-1 rounded text-slate-400 hover:text-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                          title="Edit project"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(project._id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                {/* Footer card info */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-4 shrink-0">
                  {/* Meta stats */}
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      Created {formatDate(project.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={13} />
                      {project.members?.length || 0} Members
                    </span>
                  </div>

                  {/* Avatars */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2.5 overflow-hidden">
                      {project.members?.slice(0, 3).map((member) => (
                        <div
                          key={member._id}
                          className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-350 border-2 border-white dark:border-slate-900 font-bold flex items-center justify-center text-[10px] uppercase"
                          title={member.name}
                        >
                          {member.name.charAt(0)}
                        </div>
                      ))}
                      {project.members?.length > 3 && (
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-500 border-2 border-white dark:border-slate-900 font-bold flex items-center justify-center text-[9px]">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Created by {project.createdBy?.name || 'Admin'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* 3. Pagination Controls */}
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

      {/* Project Creation/Edit Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={fetchProjects}
        project={selectedProject}
      />

      {/* Delete Confirmation Warning */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete Project?"
        message="Warning: Deleting this project will permanently remove all tasks and logged activities associated with it. This action is irreversible."
        confirmText="Yes, Delete Project"
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

export default Projects;
