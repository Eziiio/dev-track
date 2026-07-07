import { check } from 'express-validator';
import mongoose from 'mongoose';

export const createProjectRules = [
  check('title', 'Project title is required').notEmpty().trim(),
  check('title', 'Title cannot be more than 100 characters').isLength({ max: 100 }),
  check('description', 'Description cannot be more than 500 characters').optional().isLength({ max: 500 }).trim(),
  check('members', 'Members must be an array of user IDs')
    .optional()
    .isArray()
    .custom((value) => {
      if (!value.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error('All member IDs must be valid MongoDB ObjectIds');
      }
      return true;
    })
];

export const updateProjectRules = [
  check('title', 'Project title cannot be empty').optional().notEmpty().trim(),
  check('title', 'Title cannot be more than 100 characters').optional().isLength({ max: 100 }),
  check('description', 'Description cannot be more than 500 characters').optional().isLength({ max: 500 }).trim(),
  check('members', 'Members must be an array of user IDs')
    .optional()
    .isArray()
    .custom((value) => {
      if (!value.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        throw new Error('All member IDs must be valid MongoDB ObjectIds');
      }
      return true;
    })
];
