import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import logger from '../utils/logger';

export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    logger.warn(`Validation failed: ${JSON.stringify(errors.array())}`);
    
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  };
};

export const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('pin').isLength({ min: 4, max: 6 }).withMessage('PIN must be 4-6 digits'),
];

export const loginValidation = [
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('pin').isLength({ min: 4, max: 6 }).withMessage('PIN must be 4-6 digits'),
];

export const transactionValidation = [
  body('receiverPayId').notEmpty().withMessage('Receiver Pay ID is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  body('method').isIn(['PALM', 'PAYID']).withMessage('Method must be PALM or PAYID'),
];

export const biometricValidation = [
  body('palmImage').notEmpty().withMessage('Palm image is required'),
  body('handSide').isIn(['LEFT', 'RIGHT']).withMessage('Hand side must be LEFT or RIGHT'),
];