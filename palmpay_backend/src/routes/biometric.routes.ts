import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { BiometricController } from '../controllers/biometric.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, biometricValidation } from '../middleware/validation.middleware';

const router = Router();

// Rate limiting for biometric endpoints
const biometricLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many biometric attempts, please try again later'
});

router.post(
  '/enroll',
  authenticate,
  biometricLimiter,
  validate(biometricValidation),
  BiometricController.enroll
);

router.post(
  '/verify',
  authenticate,
  biometricLimiter,
  BiometricController.verify
);

router.post(
  '/identify',
  biometricLimiter,
  BiometricController.identify
);

router.get(
  '/sessions',
  authenticate,
  BiometricController.getSessions
);

export default router;