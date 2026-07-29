import prisma from '../config/database';
import { AuthService } from '../config/auth';
import { EncryptionService } from '../utils/encryption';
import logger from '../utils/logger';
import { BiometricSession, User } from '../types';

export class AuthServiceHandler {
  static async registerUser(
    name: string,
    email: string,
    phoneNumber: string,
    pin: string
  ): Promise<{ user: User; token: string }> {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phoneNumber }
        ]
      }
    });

    if (existingUser) {
      throw new Error('User with this email or phone number already exists');
    }

    // Hash PIN
    const pinHash = await AuthService.hashPin(pin);

    // Create user and wallet in transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          phoneNumber,
          pinHash,
          wallet: {
            create: {
              balance: 0
            }
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          balance: true,
          createdAt: true
        }
      });

      // Log audit
      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'USER_REGISTERED',
          details: {
            email,
            phoneNumber,
            timestamp: new Date().toISOString()
          }
        }
      });

      return newUser;
    });

    // Generate JWT token
    const token = AuthService.generateToken(user.id, user.phoneNumber);

    logger.info(`User registered: ${user.phoneNumber}`);

    return { user, token };
  }

  static async loginUser(
    phoneNumber: string,
    pin: string
  ): Promise<{ user: User; token: string }> {
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        pinHash: true,
        balance: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify PIN
    const isValidPin = await AuthService.verifyPin(pin, user.pinHash);
    if (!isValidPin) {
      // Log failed attempt
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILED',
          details: {
            reason: 'Invalid PIN',
            timestamp: new Date().toISOString()
          }
        }
      });
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = AuthService.generateToken(user.id, user.phoneNumber);

    // Log successful login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        details: {
          timestamp: new Date().toISOString()
        }
      }
    });

    logger.info(`User logged in: ${user.phoneNumber}`);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        balance: Number(user.balance),
        createdAt: user.createdAt
      },
      token
    };
  }

  static async validateToken(token: string): Promise<User> {
    try {
      const decoded = AuthService.verifyToken(token);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          balance: true,
          createdAt: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        ...user,
        balance: Number(user.balance)
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}