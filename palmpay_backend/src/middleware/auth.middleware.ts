// File: palmpay_backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phoneNumber: string;
    name: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        message: 'Please login to continue'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Please login again'
      });
    }

    req.user = {
      id: decoded.userId,
      phoneNumber: decoded.phoneNumber,
      name: decoded.name
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      message: 'Please login again'
    });
  }
};