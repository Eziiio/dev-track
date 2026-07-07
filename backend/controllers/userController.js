import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all users in the system (for member invitation assignment)
// @route   GET /api/users
// @access  Private
export const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({}, 'name email avatar role');

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: { users }
  });
});
