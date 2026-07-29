export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
export const JWT_EXPIRY = '24h';

export const BIOMETRIC_THRESHOLDS = {
  HIGH: 0.85,
  LOW: 0.65,
  PIN_REQUIRED_MIN: 0.65,
  PIN_REQUIRED_MAX: 0.85
} as const;

export const TRANSACTION_LIMITS = {
  MAX_DAILY: 50000,
  MAX_SINGLE: 10000,
  MIN_AMOUNT: 1
} as const;

export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100
} as const;

export const FASTAPI_SERVICE = {
  URL: process.env.FASTAPI_URL || 'http://localhost:8000',
  TIMEOUT: 10000,
  ENDPOINTS: {
    REGISTER: '/biometric/register',
    VERIFY: '/biometric/verify',
    IDENTIFY: '/biometric/identify'
  }
} as const;