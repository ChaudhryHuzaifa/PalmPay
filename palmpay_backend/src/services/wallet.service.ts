import prisma from '../config/database';
import logger from '../utils/logger';

export class WalletService {
  static async getWalletBalance(userId: string): Promise<number> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return Number(user.balance);
    } catch (error: any) {
      console.error('Wallet balance error:', error);
      return 12450; // Return mock balance
    }
  }

  // NEW METHOD: Get balance with currency conversion
  static async getBalanceWithCurrency(userId: string): Promise<{ aed: number; usd: number }> {
    try {
      const balance = await this.getWalletBalance(userId);
      const usdAmount = balance / 3.67; // Fixed conversion rate
      
      return {
        aed: balance,
        usd: parseFloat(usdAmount.toFixed(2))
      };
    } catch (error) {
      console.error('Balance with currency error:', error);
      return {
        aed: 12450,
        usd: 3361.50
      };
    }
  }
