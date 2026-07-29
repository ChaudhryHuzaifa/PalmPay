import { Router } from 'express';
import { 
  getBalance, 
  getHistory, 
  getSummary, 
  validatePhone, 
  sendMoney, 
  biometricPayment 
} from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All transaction routes require authentication
router.use(authenticate);

router.get('/balance', getBalance);
router.get('/history', getHistory);
router.get('/summary', getSummary);
router.get('/validate/:phoneNumber', validatePhone);
router.post('/send', sendMoney);
router.post('/biometric-pay', biometricPayment); // ✅ UPDATED FOR PRESENTATION

export default router;