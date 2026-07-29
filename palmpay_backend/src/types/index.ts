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

export interface BiometricSession {
  id: string;
  userId: string;
  confidence: number;
  decision: 'APPROVED' | 'PIN_REQUIRED' | 'REJECTED';
  createdAt: Date;
}

export interface FastAPIResponse {
  user_id?: string;
  confidence: number;
  decision: 'APPROVED' | 'PIN_REQUIRED' | 'REJECTED';
}

export interface TransactionRequest {
  receiverPayId: string;
  amount: number;
  method: 'PALM' | 'PAYID';
  biometricData?: string;
  pin?: string;
}

export interface AuthRequest {
  phoneNumber: string;
  pin: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phoneNumber: string;
  pin: string;
}

export interface BiometricEnrollRequest {
  palmImage: string;
  handSide: 'LEFT' | 'RIGHT';
  pin: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}