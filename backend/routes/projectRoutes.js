import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import {
  createProjectRules,
  updateProjectRules
} from '../validators/projectValidator.js';
import validate from '../middleware/validate.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(authorize('Admin'), createProjectRules, validate, createProject);

router
  .route('/:id')
  .get(getProjectById)
  .put(authorize('Admin'), updateProjectRules, validate, updateProject)
  .delete(authorize('Admin'), deleteProject);

export default router;
