// src/renderer/services/backendBridge.ts
const API_BASE = 'http://localhost:3000/api/v1';

// Simple backend connector
export class BackendBridge {
  private static token: string | null = null;

  static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      return await response.json();
    } catch (error) {
      console.error('Backend request failed:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Authentication
  static async login(phoneNumber: string, pin: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, pin }),
    });

    if (response.success && response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    }

    return response;
  }

  static async register(userData: { name: string; email: string; phoneNumber: string; pin: string }) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    }

    return response;
  }

  // User
  static async getProfile() {
    return this.request('/users/profile');
  }

  // Transactions
  static async getBalance() {
    const response = await this.request('/transactions/balance');
    if (response.success) {
      return response.data?.balance || 0;
    }
    return 0;
  }

  static async getTransactions(limit = 10) {
    const response = await this.request(`/transactions/history?limit=${limit}`);
    if (response.success) {
      return response.data?.transactions || [];
    }
    return [];
  }

  static async sendMoney(data: { receiverPayId: string; amount: number; method: string }) {
    return this.request('/transactions/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Biometric
  static async scanPalm(imageBase64: string) {
    return this.request('/biometric/identify', {
      method: 'POST',
      body: JSON.stringify({ palmImage: imageBase64 }),
    });
  }

  // Check if backend is available
  static async isAvailable() {
    try {
      const response = await fetch(`${API_BASE}/health`);
      const data = await response.json();
      return data.success === true;
    } catch {
      return false;
    }
  }
}

export default BackendBridge;