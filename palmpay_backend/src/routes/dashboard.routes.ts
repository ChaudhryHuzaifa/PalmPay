import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Complete dashboard endpoint
router.get('/', authenticate, DashboardController.getCompleteDashboard);

export default router;