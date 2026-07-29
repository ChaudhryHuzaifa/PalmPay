// src/renderer/services/api.ts
import { User, Transaction, BiometricProfile, BiometricSession } from '../types';

const API_BASE_URL = 'http://localhost:3000/api/v1';
const BIOMETRIC_SERVICE_URL = 'http://localhost:8000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
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
  palmImage: string; // base64 without prefix
  handSide: 'LEFT' | 'RIGHT';
  pin: string;
}

export interface TransactionRequest {
  receiverPayId: string;
  amount: number;
  method: 'PALM' | 'PAYID';
  biometricData?: string; // base64 without prefix
  pin?: string;
}

export interface ReceiveRequest {
  amount: number;
  palmImage: string; // base64 without prefix
}

class ApiService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }

  // ==================== AUTHENTICATION ====================
  async login(phoneNumber: string, pin: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, pin }),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        this.token = data.data.token;
        this.user = data.data.user;
        
        // Store in localStorage
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        this.token = data.data.token;
        this.user = data.data.user;
        
        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  logout(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  // ==================== USER PROFILE ====================
  async getProfile(): Promise<ApiResponse<User>> {
    if (!this.token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async updateProfile(name: string, email: string): Promise<ApiResponse<User>> {
    if (!this.token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ==================== BIOMETRIC ====================
  async enrollBiometric(data: BiometricEnrollRequest): Promise<ApiResponse<BiometricProfile>> {
    if (!this.token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/biometric/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async verifyBiometric(palmImage: string): Promise<ApiResponse<BiometricSession>> {
    if (!this.token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/biometric/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ palmImage }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async identifyBiometric(palmImage: string): Promise<ApiResponse<{ userId: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/biometric/identify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ palmImage }),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async getBiometricSessions(limit = 10): Promise<ApiResponse<BiometricSession[]>> {
    if (!this.token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/biometric/sessions?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ==================== TRANSACTIONS ====================
  async sendMoney(data: TransactionRequest): Promise<ApiResponse<Transaction>> {
    if (!this.token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/transactions/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async receiveMoney(data: ReceiveRequest): Promise<ApiResponse<Transaction>> {
    if (!this.token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/transactions/receive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async getTransactionHistory(limit = 20, offset = 0): Promise<ApiResponse<{ transactions: Transaction[]; total: number }>> {
    if (!this.token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/transactions/history?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async getBalance(): Promise<ApiResponse<{ balance: number }>> {
    if (!this.token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/transactions/balance`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async getDashboardStats(): Promise<ApiResponse<any>> {
    if (!this.token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ==================== SYSTEM HEALTH ====================
  async checkBackendHealth(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async checkBiometricHealth(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${BIOMETRIC_SERVICE_URL}/health`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // ==================== GETTERS ====================
  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;