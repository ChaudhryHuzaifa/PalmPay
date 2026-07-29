import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRY } from './constants';

export class AuthService {
  static async hashPin(pin: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(pin, saltRounds);
  }

  static async verifyPin(pin: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(pin, hash);
  }

  static generateToken(userId: string, phoneNumber: string): string {
    return jwt.sign(
      { userId, phoneNumber },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}