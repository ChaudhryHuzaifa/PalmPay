import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticate, UserController.getProfile);
router.put('/profile', authenticate, UserController.updateProfile);
router.get('/audit-logs', authenticate, UserController.getAuditLogs);
router.get('/dashboard-stats', authenticate, UserController.getDashboardStats);

// NEW ROUTES: Added for frontend compatibility
router.get('/stats', authenticate, UserController.getStats);
router.get('/biometric-status', authenticate, UserController.getBiometricStatus);

export default router;