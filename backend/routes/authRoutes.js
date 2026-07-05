import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile
} from '../controllers/authController.js';
import {
  registerRules,
  loginRules,
  updateProfileRules
} from '../validators/authValidator.js';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerRules, validate, registerUser);
router.post('/login', loginRules, validate, loginUser);
router.post('/logout', protect, logoutUser);

router
  .route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfileRules, validate, updateProfile);

export default router;
