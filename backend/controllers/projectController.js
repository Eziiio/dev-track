import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getProjects = asyncHandler(async (req, res, next) => {
  let query;

  // Build query based on role
  // Admins see all projects, Members only see projects they belong to
  if (req.user.role === 'Admin') {
    query = {};
  } else {
    query = { members: req.user.id };
  }

  // Search by title (regex case-insensitive)
  if (req.query.search) {
    query.title = { $regex: req.query.search, $options: 'i' };
  }

  // Pagination config
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;

  const total = await Project.countDocuments(query);
  const pages = Math.ceil(total / limit);

  // Execute query with populate
  const projects = await Project.find(query)
    .populate('createdBy', 'name email avatar')
    .populate('members', 'name email avatar')
    .skip(startIndex)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Projects retrieved successfully',
    data: {
      projects,
      pagination: {
        total,
        page,
        pages,
        limit
      }
    }
  });
});

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', 'name email avatar')
    .populate('members', 'name email avatar');

  if (!project) {
    return next(new ErrorResponse('Project not found', 404));
  }

  // Member authorization check (must be a member of the project)
  if (
    req.user.role !== 'Admin' &&
    !project.members.some((m) => m._id.toString() === req.user.id)
  ) {
    return next(new ErrorResponse('Not authorized to access this project', 403));
  }

  res.status(200).json({
    success: true,
    message: 'Project retrieved successfully',
    data: { project }
  });
});

// @desc    Create project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = asyncHandler(async (req, res, next) => {
  const { title, description, members = [] } = req.body;

  // Add the creator's ID to the members list if not already present
  if (!members.includes(req.user.id)) {
    members.push(req.user.id);
  }

  const project = await Project.create({
    title,
    description,
    members,
    createdBy: req.user.id
  });

  // Log activity
  await Activity.create({
    action: 'created project',
    user: req.user.id,
    project: project._id
  });

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: { project }
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
export const updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ErrorResponse('Project not found', 404));
  }

  // Ensure members list still includes the creator if we are replacing members
  const { title, description, members } = req.body;
  const updateData = {};

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (members !== undefined) {
    // Keep creator in project members
    if (!members.includes(project.createdBy.toString())) {
      members.push(project.createdBy.toString());
    }
    updateData.members = members;
  }

  project = await Project.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  })
    .populate('createdBy', 'name email avatar')
    .populate('members', 'name email avatar');

  // Log activity
  await Activity.create({
    action: 'updated project',
    user: req.user.id,
    project: project._id
  });

  res.status(200).json({
    success: true,
    message: 'Project updated successfully',
    data: { project }
  });
});

// @desc    Delete project & cascade delete tasks
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ErrorResponse('Project not found', 404));
  }

  // Delete project
  await Project.findByIdAndDelete(req.params.id);

  // Cascade delete all tasks associated with this project
  await Task.deleteMany({ projectId: req.params.id });

  // Log activity (note: project document is deleted, but we keep its ID in the log)
  await Activity.create({
    action: 'deleted project',
    user: req.user.id,
    project: project._id
  });

  res.status(200).json({
    success: true,
    message: 'Project and associated tasks deleted successfully',
    data: {}
  });
});
