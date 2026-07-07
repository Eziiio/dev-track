import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import {
  createTaskRules,
  updateTaskRules
} from '../validators/taskValidator.js';
import validate from '../middleware/validate.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(createTaskRules, validate, createTask);

router
  .route('/:id')
  .get(getTaskById)
  .put(updateTaskRules, validate, updateTask)
  .delete(authorize('Admin'), deleteTask);

export default router;
