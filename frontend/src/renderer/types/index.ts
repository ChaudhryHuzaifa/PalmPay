// src/renderer/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  balance: number;
  createdAt: Date;
}

export interface BiometricProfile {
  id: string;
  userId: string;
  embedding: string;
  threshold: number;
  handSide: 'LEFT' | 'RIGHT';
  createdAt: Date;
}

export interface BiometricSession {
  id: string;
  userId: string;
  confidence: number;
  decision: 'APPROVED' | 'PIN_REQUIRED' | 'REJECTED';
  createdAt: Date;
}

export interface Transaction {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  method: 'PALM' | 'PAYID';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'PIN_REQUIRED';
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface DashboardStats {
  monthlyTransactions: {
    count: number;
    volume: number;
  };
  biometricStats: {
    avgConfidence: number;
    totalAttempts: number;
  };
}