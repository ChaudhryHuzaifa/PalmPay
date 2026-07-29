import { Router } from 'express';
import { DebugController } from '../controllers/debug.controller';

const router = Router();

router.get('/test-db', DebugController.testDatabase);
router.get('/test-registration', DebugController.testRegistrationFlow);
router.get('/check-services', DebugController.checkServices);

export default router;