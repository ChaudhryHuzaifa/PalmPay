export interface Balance {
  aed: number;
  usd: string;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit';
  description: string;
  recipient: string;
  status: string;
  date: string;
}

export interface UserStats {
  today: number;
  weekly: number;
  monthly: number;
  totalTransactions: number;
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
    overall: number;
  };
}

export interface BiometricData {
  palmEnrolled: boolean;
  confidence: number;
  lastUsed: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  balance: number;
  createdAt: string;
  biometricEnrolled?: boolean;
  biometricConfidence?: number;
}