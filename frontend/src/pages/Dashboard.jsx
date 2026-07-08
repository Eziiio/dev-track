import React, { useState, useEffect } from 'react';
import dashboardService from '../services/dashboardService';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  Calendar,
  AlertCircle,
  TrendingUp,
  Activity as ActivityIcon,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getDashboardData();
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  // Date formatting utility
  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Relative time helper
  const getRelativeTime = (dateStr) => {
    const timestamp = new Date(dateStr).getTime();
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Badge coloring helpers
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50';
      case 'Medium':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50';
      default:
        return 'bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border-sky-200/50 dark:border-sky-800/50';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Done':
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50';
      case 'In Progress':
        return 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border-primary-200/50 dark:border-primary-800/50';
      case 'Review':
        return 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50';
      default:
        return 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/50';
    }
  };

  // Activity icon styling helper
  const getActivityIconStyles = (action) => {
    if (action.includes('created')) {
      return { dot: 'bg-emerald-500' };
    }
    if (action.includes('deleted')) {
      return { dot: 'bg-rose-500' };
    }
    return { dot: 'bg-primary-500' };
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* 1. Skeletons for Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3" />
          ))}
        </div>

        {/* 2. Skeletons for Grid Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[720px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />
          </div>
          <div className="h-[720px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6" />
        </div>
      </div>
    );
  }

  const { totals = {}, projectProgress = [], upcomingDeadlines = [], recentActivities = [], charts = {} } = data || {};

  const statCards = [
    { label: 'Total Projects', value: totals.totalProjects, icon: FolderKanban, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/30' },
    { label: 'Total Tasks', value: totals.totalTasks, icon: CheckSquare, color: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 border-primary-200/30' },
    { label: 'Completed Tasks', value: totals.completedTasks, icon: TrendingUp, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/30' },
    { label: 'Pending Tasks', value: totals.pendingTasks, icon: Clock, color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200/30' },
    { label: 'Overdue Tasks', value: totals.overdueTasks, icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200/30' },
    { label: 'Due Today', value: totals.tasksDueToday, icon: Calendar, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200/30' }
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Statistics metrics cards grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          const colors = card.color.split(' ');
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl border ${colors[1]} ${colors[2]} ${colors[3]}`}>
                  <Icon size={14} className={colors[0]} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                  {card.value}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* 2. Charts & Activities Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardCharts charts={charts} projectProgress={projectProgress} />
        </div>

        {/* Recent Activities timeline */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col h-[720px]">
          <h2 className="font-display text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 shrink-0">
            <ActivityIcon className="text-primary-500" size={16} />
            Recent Activities
          </h2>

          <div className="flex-1 overflow-y-auto pr-1 space-y-6 relative border-l border-slate-150 dark:border-slate-800/80 ml-3 pl-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-16 space-y-2.5 -ml-4">
                <ActivityIcon size={32} className="text-slate-300 mx-auto" />
                <p className="text-slate-400 text-xs font-medium">No activity logged yet.</p>
              </div>
            ) : (
              recentActivities.map((act) => {
                const colors = getActivityIconStyles(act.action);
                return (
                  <div key={act._id} className="relative group text-xs">
                    <span className={`absolute -left-[23px] top-0.5 w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 flex-shrink-0 ${colors.dot}`} />
                    <div className="space-y-1">
                      <p className="text-slate-600 dark:text-slate-350 font-medium leading-relaxed">
                        <span className="font-bold text-slate-800 dark:text-white">{act.user?.name || 'Someone'}</span>
                        {' '}{act.action}
                        {act.task && <span className="font-semibold text-slate-700 dark:text-slate-200"> "{act.task.title}"</span>}
                        {act.project && <span className="text-[10px] text-slate-400 dark:text-slate-500 block">in {act.project.title}</span>}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-550 font-bold">{getRelativeTime(act.timestamp)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* 3. Detailed Progress & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Project Progress */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-display text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="text-primary-500" size={16} />
              Project Progress
            </h2>
            {projectProgress.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-medium">No active projects found.</div>
            ) : (
              <div className="space-y-4">
                {projectProgress.map((project) => (
                  <div key={project._id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300 truncate pr-4">{project.title}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                        {project.completedTasks}/{project.totalTasks} Tasks ({project.progress}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary-500 h-full rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Upcoming Deadlines */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="font-display text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Calendar className="text-primary-500" size={16} />
              Upcoming Deadlines
            </h2>
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-medium">No upcoming deadlines.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {upcomingDeadlines.map((task) => (
                  <div key={task._id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="space-y-1 min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate text-xs sm:text-sm">{task.title}</p>
                      <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-150">{task.projectId?.title}</span>
                        <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getPriorityBadgeClass(task.priority)}`}>{task.priority}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getStatusBadgeClass(task.status)}`}>{task.status}</span>
                      {task.assignedTo ? (
                        <div className="w-6 h-6 rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-350 font-bold flex items-center justify-center text-[9px] border border-primary-200/20" title={task.assignedTo.name}>
                          {task.assignedTo.name.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-slate-150 dark:bg-slate-850 text-slate-400 flex items-center justify-center border border-slate-200" title="Unassigned">
                          <User size={10} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>

    </div>
  );
}

export default Dashboard;
