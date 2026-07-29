import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate, registerValidation, loginValidation } from '../middleware/validation.middleware';

const router = Router();

// Standard auth routes
router.post('/register', validate(registerValidation), AuthController.register);
router.post('/login', validate(loginValidation), AuthController.login);
router.get('/profile', authenticate, AuthController.profile);

// ✅ UPDATED FOR PRESENTATION: Biometric routes
router.post('/register-with-biometric', AuthController.registerWithBiometric);
router.post('/biometric-login', AuthController.biometricLogin);
router.post('/enroll-biometric', authenticate, AuthController.enrollBiometric);

export default router;