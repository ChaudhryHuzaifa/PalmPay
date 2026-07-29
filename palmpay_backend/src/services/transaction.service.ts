import prisma from '../config/database';
import { AuthService } from '../config/auth';
import { BiometricService } from './biometric.service';
import { TRANSACTION_LIMITS } from '../config/constants';
import logger from '../utils/logger';
import { Transaction, TransactionRequest } from '../types';

export class TransactionService {
  static async processTransaction(
    senderId: string,
    request: TransactionRequest
  ): Promise<Transaction> {
    const { receiverPayId, amount, method, biometricData, pin } = request;

    // Validate amount
    if (amount < TRANSACTION_LIMITS.MIN_AMOUNT) {
      throw new Error(`Minimum transaction amount is ${TRANSACTION_LIMITS.MIN_AMOUNT}`);
    }

    if (amount > TRANSACTION_LIMITS.MAX_SINGLE) {
      throw new Error(`Maximum single transaction is ${TRANSACTION_LIMITS.MAX_SINGLE}`);
    }

    // Find receiver by Pay ID (phone number)
    const receiver = await prisma.user.findUnique({
      where: { phoneNumber: receiverPayId }
    });

    if (!receiver) {
      throw new Error('Receiver not found');
    }

    if (senderId === receiver.id) {
      throw new Error('Cannot send money to yourself');
    }

    // Check sender's balance
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { balance: true, pinHash: true }
    });

    if (!sender) {
      throw new Error('Sender not found');
    }

    if (Number(sender.balance) < amount) {
      throw new Error('Insufficient balance');
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyTransactions = await prisma.transaction.aggregate({
      where: {
        senderId,
        status: 'COMPLETED',
        createdAt: {
          gte: today
        }
      },
      _sum: {
        amount: true
      }
    });

    const dailyTotal = Number(dailyTransactions._sum.amount || 0);
    if (dailyTotal + amount > TRANSACTION_LIMITS.MAX_DAILY) {
      throw new Error('Daily transaction limit exceeded');
    }

    let status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'PIN_REQUIRED' = 'PENDING';

    // Handle authentication based on method
    if (method === 'PALM' && biometricData) {
      const verification = await BiometricService.verifyBiometric(senderId, biometricData);
      
      if (verification.decision === 'APPROVED') {
        status = 'COMPLETED';
      } else if (verification.decision === 'PIN_REQUIRED') {
        status = 'PIN_REQUIRED';
      } else {
        status = 'FAILED';
        throw new Error('Biometric authentication failed');
      }
    }

    // If PIN is required or method is PAYID, verify PIN
    if (status === 'PIN_REQUIRED' || method === 'PAYID') {
      if (!pin) {
        throw new Error('PIN is required for this transaction');
      }

      const isValidPin = await AuthService.verifyPin(pin, sender.pinHash);
      if (!isValidPin) {
        status = 'FAILED';
        throw new Error('Invalid PIN');
      }

      status = 'COMPLETED';
    }

    // Process transaction
    const transaction = await prisma.$transaction(async (tx) => {
      // Create transaction record
      const newTransaction = await tx.transaction.create({
        data: {
          senderId,
          receiverId: receiver.id,
          amount,
          method,
          status
        },
        select: {
          id: true,
          senderId: true,
          receiverId: true,
          amount: true,
          method: true,
          status: true,
          createdAt: true
        }
      });

      // Update balances if transaction is completed
      if (status === 'COMPLETED') {
        await tx.user.update({
          where: { id: senderId },
          data: {
            balance: {
              decrement: amount
            }
          }
        });

        await tx.user.update({
          where: { id: receiver.id },
          data: {
            balance: {
              increment: amount
            }
          }
        });

        // Update transaction status
        await tx.transaction.update({
          where: { id: newTransaction.id },
          data: { status: 'COMPLETED' }
        });
      }

      // Log transaction
      await tx.auditLog.create({
        data: {
          userId: senderId,
          action: 'TRANSACTION_PROCESSED',
          details: {
            transactionId: newTransaction.id,
            amount,
            method,
            status,
            receiver: receiverPayId,
            timestamp: new Date().toISOString()
          }
        }
      });

      return {
        ...newTransaction,
        amount: Number(newTransaction.amount)
      };
    });

    logger.info(`Transaction processed: ${transaction.id}, amount: ${amount}, status: ${status}`);

    return transaction;
  }

  static async receiveMoney(
    receiverId: string,
    amount: number,
    biometricData: string
  ): Promise<Transaction> {
    // Verify receiver's biometric
    const verification = await BiometricService.verifyBiometric(receiverId, biometricData);
    
    if (verification.decision !== 'APPROVED') {
      throw new Error('Biometric authentication failed');
    }

    // In a real system, this would involve a merchant/sender
    // For demo, we'll create a system sender
    const systemSenderId = '00000000-0000-0000-0000-000000000000';

    const transaction = await prisma.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          senderId: systemSenderId,
          receiverId,
          amount,
          method: 'PALM',
          status: 'COMPLETED'
        }
      });

      // Update receiver's balance
      await tx.user.update({
        where: { id: receiverId },
        data: {
          balance: {
            increment: amount
          }
        }
      });

      // Log transaction
      await tx.auditLog.create({
        data: {
          userId: receiverId,
          action: 'MONEY_RECEIVED',
          details: {
            transactionId: newTransaction.id,
            amount,
            method: 'PALM',
            timestamp: new Date().toISOString()
          }
        }
      });

      return newTransaction;
    });

    logger.info(`Money received: ${transaction.id}, amount: ${amount}, receiver: ${receiverId}`);

    return {
      ...transaction,
      amount: Number(transaction.amount)
    };
  }

  static async getTransactionHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          senderId: true,
          receiverId: true,
          amount: true,
          method: true,
          status: true,
          createdAt: true
        }
      }),
      prisma.transaction.count({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      })
    ]);

    return {
      transactions: transactions.map(t => ({
        ...t,
        amount: Number(t.amount)
      })),
      total
    };
  }

  static async getTransactionSummary(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthlyTransactions = await prisma.transaction.aggregate({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ],
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1)
        }
      },
      _sum: {
        amount: true
      },
      _count: true
    });

    return {
      monthlyCount: monthlyTransactions._count,
      monthlyVolume: Number(monthlyTransactions._sum.amount || 0)
    };
  }
}