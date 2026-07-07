import { check } from 'express-validator';
import mongoose from 'mongoose';

export const createTaskRules = [
  check('title', 'Task title is required').notEmpty().trim(),
  check('title', 'Title cannot be more than 150 characters').isLength({ max: 150 }),
  check('projectId', 'Project ID is required').notEmpty(),
  check('projectId', 'Invalid Project ID').custom((id) => mongoose.Types.ObjectId.isValid(id)),
  check('description', 'Description must be a string').optional().isString().trim(),
  check('assignedTo', 'Invalid Assignee User ID')
    .optional({ nullable: true, checkFalsy: true })
    .custom((id) => id === null || mongoose.Types.ObjectId.isValid(id)),
  check('priority', 'Priority must be Low, Medium, or High')
    .optional()
    .isIn(['Low', 'Medium', 'High']),
  check('status', 'Status must be To Do, In Progress, Review, or Done')
    .optional()
    .isIn(['To Do', 'In Progress', 'Review', 'Done']),
  check('dueDate', 'Due date must be a valid date')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .toDate(),
  check('labels', 'Labels must be an array of strings')
    .optional()
    .isArray()
    .custom((value) => {
      if (!value.every((item) => typeof item === 'string')) {
        throw new Error('All labels must be strings');
      }
      return true;
    })
];

export const updateTaskRules = [
  check('title', 'Task title cannot be empty').optional().notEmpty().trim(),
  check('title', 'Title cannot be more than 150 characters').optional().isLength({ max: 150 }),
  check('projectId', 'Invalid Project ID')
    .optional()
    .custom((id) => mongoose.Types.ObjectId.isValid(id)),
  check('description', 'Description must be a string').optional().isString().trim(),
  check('assignedTo', 'Invalid Assignee User ID')
    .optional({ nullable: true, checkFalsy: true })
    .custom((id) => id === null || mongoose.Types.ObjectId.isValid(id)),
  check('priority', 'Priority must be Low, Medium, or High')
    .optional()
    .isIn(['Low', 'Medium', 'High']),
  check('status', 'Status must be To Do, In Progress, Review, or Done')
    .optional()
    .isIn(['To Do', 'In Progress', 'Review', 'Done']),
  check('dueDate', 'Due date must be a valid date')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .toDate(),
  check('labels', 'Labels must be an array of strings')
    .optional()
    .isArray()
    .custom((value) => {
      if (!value.every((item) => typeof item === 'string')) {
        throw new Error('All labels must be strings');
      }
      return true;
    })
];
