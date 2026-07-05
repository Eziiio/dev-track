import { check } from 'express-validator';

export const registerRules = [
  check('name', 'Name is required').notEmpty().trim(),
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password must be at least 6 characters long').isLength({ min: 6 }),
  check('role', 'Role must be Admin or Member').optional().isIn(['Admin', 'Member'])
];

export const loginRules = [
  check('email', 'Please include a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').notEmpty()
];

export const updateProfileRules = [
  check('name', 'Name cannot be empty').optional().notEmpty().trim(),
  check('email', 'Please include a valid email').optional().isEmail().normalizeEmail(),
  check('password', 'Password must be at least 6 characters long').optional().isLength({ min: 6 }),
  check('avatar', 'Avatar must be a valid string').optional().isString()
];
