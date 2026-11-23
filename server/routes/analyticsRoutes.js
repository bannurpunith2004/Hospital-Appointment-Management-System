import express from 'express';
import {
  getDashboardStats,
  getDashboardAnalytics,
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/analytics', authorize('admin', 'doctor'), getDashboardAnalytics);

export default router;
