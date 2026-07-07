import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get dashboard metrics and activities
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = asyncHandler(async (req, res, next) => {
  // Determine project scope based on role
  let projectsQuery = {};
  if (req.user.role !== 'Admin') {
    projectsQuery = { members: req.user.id };
  }

  // Fetch projects in scope
  const projects = await Project.find(projectsQuery);
  const projectIds = projects.map((p) => p._id);

  // Time boundaries for Today
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // Fetch concurrent metrics
  const [
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    tasksDueToday,
    upcomingDeadlines,
    recentActivities,
    allTasks
  ] = await Promise.all([
    Project.countDocuments(projectsQuery),
    Task.countDocuments({ projectId: { $in: projectIds } }),
    Task.countDocuments({ projectId: { $in: projectIds }, status: 'Done' }),
    Task.countDocuments({ projectId: { $in: projectIds }, status: { $ne: 'Done' } }),
    Task.countDocuments({
      projectId: { $in: projectIds },
      dueDate: { $lt: new Date() },
      status: { $ne: 'Done' }
    }),
    Task.countDocuments({
      projectId: { $in: projectIds },
      dueDate: { $gte: startOfToday, $lte: endOfToday },
      status: { $ne: 'Done' }
    }),
    // Upcoming Deadlines: next 5 incomplete tasks sorted by due date ascending
    Task.find({
      projectId: { $in: projectIds },
      status: { $ne: 'Done' },
      dueDate: { $ne: null }
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate('assignedTo', 'name email avatar')
      .populate('projectId', 'title'),
    // Recent Activities: last 10 activities sorted by timestamp descending
    Activity.find({ project: { $in: projectIds } })
      .populate('user', 'name email avatar')
      .populate('task', 'title')
      .populate('project', 'title')
      .sort({ timestamp: -1 })
      .limit(10),
    // Fetch all tasks in scope to calculate stats in Node (efficient roundtrip)
    Task.find({ projectId: { $in: projectIds } })
  ]);

  // 1. Calculate Task Status statistics
  const statusStats = {
    'To Do': 0,
    'In Progress': 0,
    'Review': 0,
    'Done': 0
  };

  // 2. Calculate Priority statistics
  const priorityStats = {
    'Low': 0,
    'Medium': 0,
    'High': 0
  };

  allTasks.forEach((task) => {
    if (statusStats[task.status] !== undefined) {
      statusStats[task.status]++;
    }
    if (priorityStats[task.priority] !== undefined) {
      priorityStats[task.priority]++;
    }
  });

  // 3. Calculate Project-by-Project Progress
  const projectProgress = projects.map((project) => {
    const projectTasks = allTasks.filter((t) => t.projectId.toString() === project._id.toString());
    const totalProjTasks = projectTasks.length;
    const completedProjTasks = projectTasks.filter((t) => t.status === 'Done').length;
    const progress = totalProjTasks > 0 ? Math.round((completedProjTasks / totalProjTasks) * 100) : 0;

    return {
      _id: project._id,
      title: project.title,
      totalTasks: totalProjTasks,
      completedTasks: completedProjTasks,
      progress
    };
  });

  res.status(200).json({
    success: true,
    message: 'Dashboard stats retrieved successfully',
    data: {
      totals: {
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        tasksDueToday
      },
      projectProgress,
      upcomingDeadlines,
      recentActivities,
      charts: {
        statusStats,
        priorityStats
      }
    }
  });
});
