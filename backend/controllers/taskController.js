import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

// @desc    Get all tasks (with filters, search, sort, pagination)
// @route   GET /api/tasks
export const getTasks = asyncHandler(async (req, res, next) => {
  const query = {};

  // Resolve projects the user has access to
  let userProjectIds = [];
  if (req.user.role !== 'Admin') {
    const memberProjects = await Project.find({ members: req.user.id });
    userProjectIds = memberProjects.map((p) => p._id.toString());
  }

  // Filter by Project
  if (req.query.projectId) {
    const projectIdStr = req.query.projectId.toString();
    if (req.user.role !== 'Admin' && !userProjectIds.includes(projectIdStr)) {
      return next(new ErrorResponse('Not authorized to view tasks in this project', 403));
    }
    query.projectId = req.query.projectId;
  } else if (req.user.role !== 'Admin') {
    query.projectId = { $in: userProjectIds };
  }

  if (req.query.status) query.status = req.query.status;
  if (req.query.priority) query.priority = req.query.priority;
  if (req.query.assignedTo) query.assignedTo = req.query.assignedTo;

  // Title / Description Text Search
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Sorting
  let sortOption = { createdAt: -1 };
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sortOption = { [parts[0]]: parts[1] === 'asc' ? 1 : -1 };
  }

  // Pagination config
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const total = await Task.countDocuments(query);
  const pages = Math.ceil(total / limit);

  const tasks = await Task.find(query)
    .populate('projectId', 'title')
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .sort(sortOption)
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully',
    data: {
      tasks,
      pagination: { total, page, pages, limit }
    }
  });
});

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
export const getTaskById = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('projectId', 'title')
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  if (!task) {
    return next(new ErrorResponse('Task not found', 404));
  }

  // Authorization check (must be Admin or part of the project)
  const project = await Project.findById(task.projectId);
  if (
    req.user.role !== 'Admin' &&
    (!project || !project.members.some((m) => m._id.toString() === req.user.id))
  ) {
    return next(new ErrorResponse('Not authorized to access this task', 403));
  }

  res.status(200).json({
    success: true,
    message: 'Task retrieved successfully',
    data: { task }
  });
});

// @desc    Create task
// @route   POST /api/tasks
export const createTask = asyncHandler(async (req, res, next) => {
  const { title, description, projectId, assignedTo, priority, status, dueDate, labels } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    return next(new ErrorResponse('Associated project not found', 404));
  }

  if (req.user.role !== 'Admin' && !project.members.some((m) => m._id.toString() === req.user.id)) {
    return next(new ErrorResponse('Not authorized to create tasks in this project', 403));
  }

  if (req.user.role !== 'Admin' && assignedTo) {
    return next(new ErrorResponse('Only administrators can assign tasks', 403));
  }

  if (assignedTo && !project.members.some((m) => m._id.toString() === assignedTo)) {
    return next(new ErrorResponse('Assignee must be a member of the project', 400));
  }

  const task = await Task.create({
    title, description, projectId,
    assignedTo: assignedTo || null,
    priority, status,
    dueDate: dueDate || null,
    labels, createdBy: req.user.id
  });

  await Activity.create({
    action: 'created task',
    user: req.user.id,
    task: task._id,
    project: projectId
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task }
  });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
export const updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);
  if (!task) return next(new ErrorResponse('Task not found', 404));

  const project = await Project.findById(task.projectId);
  if (!project) return next(new ErrorResponse('Associated project not found for this task', 404));

  const isCreator = task.createdBy.toString() === req.user.id;
  const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user.id;
  const isAdmin = req.user.role === 'Admin';

  if (!isAdmin && !isCreator && !isAssignee) {
    return next(new ErrorResponse('Not authorized to update this task', 403));
  }

  const { title, description, assignedTo, priority, status, dueDate, labels } = req.body;
  const originalStatus = task.status;

  if (!isAdmin) {
    if (isAssignee && !isCreator) {
      const keys = Object.keys(req.body).filter((k) => req.body[k] !== undefined);
      if (keys.length > 1 || !keys.includes('status')) {
        return next(new ErrorResponse('Members can only update the status of tasks assigned to them', 403));
      }
    }
    if (isCreator && assignedTo !== undefined && assignedTo !== (task.assignedTo?.toString() || null)) {
      return next(new ErrorResponse('Only administrators can assign tasks', 403));
    }
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (priority !== undefined) updateData.priority = priority;
  if (status !== undefined) updateData.status = status;
  if (dueDate !== undefined) updateData.dueDate = dueDate;
  if (labels !== undefined) updateData.labels = labels;

  if (assignedTo !== undefined && isAdmin) {
    if (assignedTo !== null && !project.members.some((m) => m._id.toString() === assignedTo)) {
      return next(new ErrorResponse('Assignee must be a member of the project', 400));
    }
    updateData.assignedTo = assignedTo;
  }

  task = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
    .populate('projectId', 'title')
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar');

  let actionString = 'updated task';
  if (status && status !== originalStatus) {
    actionString = `updated task status to ${status}`;
  }

  await Activity.create({
    action: actionString,
    user: req.user.id,
    task: task._id,
    project: task.projectId._id
  });

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: { task }
  });
});

// @desc    Delete task (Admin only)
// @route   DELETE /api/tasks/:id
export const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) return next(new ErrorResponse('Task not found', 404));

  if (req.user.role !== 'Admin') {
    return next(new ErrorResponse('Only administrators can delete tasks', 403));
  }

  await Task.findByIdAndDelete(req.params.id);

  await Activity.create({
    action: 'deleted task',
    user: req.user.id,
    project: task.projectId
  });

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: {}
  });
});
