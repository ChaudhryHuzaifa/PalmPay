
// File: frontend/src/renderer/utils/apiService.ts
import { toast } from 'react-hot-toast';

// ========== TEMPORARY FIX: REMOVE PROBLEMATIC HEADERS ==========
// This fixes the CORS issue immediately
const originalFetch = window.fetch;
window.fetch = async function(url: RequestInfo | URL, options?: RequestInit) {
  if (options?.headers) {
    // Remove all problematic headers for CORS
    const headers = new Headers(options.headers);
    headers.delete('x-request-id');
    headers.delete('X-Request-ID');
    headers.delete('X-Request-Id');
    headers.delete('X-REQUEST-ID');
    options.headers = headers;
  }
  return originalFetch(url, options);
};
// ========== END TEMPORARY FIX ==========

// ========== DIRECT URL CONFIGURATION ==========
const API_BASE_URL = 'http://localhost:3000/api/v1';
const BIOMETRIC_SERVICE_URL = 'http://localhost:8000';

console.log('🌍 API Configuration:', {
  backend: API_BASE_URL,
  biometric: BIOMETRIC_SERVICE_URL,
  timestamp: new Date().toISOString()
});

// ==================== INTERFACES ====================
export interface BackendUser {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  balance: number;
  payId: string;
  createdAt: string;
  updatedAt: string;
  biometricEnrolled?: boolean;
  biometricEnrollmentDate?: string;
  biometricConfidence?: number;
}

export interface BackendTransaction {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  method: 'PALM' | 'PAYID' | 'CARD' | 'BANK_TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'PIN_REQUIRED';
  createdAt: string;
  updatedAt: string;
  description?: string;
  sender?: BackendUser;
  receiver?: BackendUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'payment' | 'topup';
  amount: number;
  recipient?: string;
  sender?: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface ServiceStatus {
  backend: boolean;
  biometric: boolean;
  database: boolean;
  details: {
    backend: string;
    biometric: string;
    database: string;
  };
}

export interface UserStats {
  today: { income: number; expenses: number; net: number; transactionCount: number };
  weekly: { income: number; expenses: number; net: number; transactionCount: number };
  monthly: { income: number; expenses: number; net: number; transactionCount: number };
  totalTransactions: number;
  biometricEnrolled: boolean;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
  uptime: number;
  database: boolean;
  services: {
    backend: boolean;
    biometric: boolean;
    database: boolean;
  };
}

export interface BiometricEnrollmentResponse {
  success: boolean;
  userId: string;
  confidence: number;
  message: string;
  biometricEnrolled: boolean;
}

export interface BiometricVerificationResponse {
  success: boolean;
  userId?: string;
  confidence: number;
  message: string;
  verified: boolean;
}

export interface PaymentIntent {
  id: string;
  merchantId: string;
  customerId?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  palmImage?: string;
  expiresAt: string;
  createdAt: string;
  completedAt?: string;
}

// ==================== API SERVICE CLASS ====================
class ApiService {
  private token: string | null = null;
  private user: BackendUser | null = null;
  private isDemoMode: boolean = false;
  private requestCount: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
          console.log('🔑 Loaded user from localStorage:', this.user?.name);
        } catch (e) {
          console.error('Failed to parse user:', e);
        }
      }
      
      // Check if we should be in demo mode
      const demoMode = localStorage.getItem('demo_mode');
      if (demoMode === 'true') {
        this.isDemoMode = true;
        console.log('🎭 DEMO MODE ENABLED');
      }
    }
  }

  // ========== BIOMETRIC METHODS ==========
  
  async registerBiometric(imageBase64: string): Promise<ApiResponse<BiometricEnrollmentResponse>> {
    console.log('🖐️ Registering biometric data');
    return this.request<BiometricEnrollmentResponse>('/auth/enroll-biometric', {
      method: 'POST',
      body: JSON.stringify({ palmImage: imageBase64 })
    });
  }

  async verifyBiometric(imageBase64: string): Promise<ApiResponse<BiometricVerificationResponse>> {
    console.log('🖐️ Verifying biometric data');
    return this.request<BiometricVerificationResponse>('/biometric/verify', {
      method: 'POST',
      body: JSON.stringify({ palmImage: imageBase64 })
    });
  }

  async biometricLogin(imageBase64: string): Promise<ApiResponse<{ user: BackendUser; token: string }>> {
    console.log('🔐 Biometric login attempt');
    
    const response = await this.request<{ user: BackendUser; token: string }>('/auth/biometric-login', {
      method: 'POST',
      body: JSON.stringify({ palmImage: imageBase64 })
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      this.user = response.data.user;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('auth_user', JSON.stringify(this.user));
      console.log('✅ Biometric login successful:', this.user.name);
      
      // Disable demo mode on successful real login
      this.disableDemoMode();
      toast.success('Biometric login successful!');
    } else {
      toast.error(response.error || 'Biometric verification failed');
    }

    return response;
  }

  async receiveBiometricPayment(amount: number, customerPalmImage: string): Promise<ApiResponse<any>> {
    console.log('💰 Receiving biometric payment:', amount);
    return this.request<any>('/payment/receive', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        customerPalmImage
      })
    });
  }

  async enrollBiometric(name: string, phone: string, password: string, palmImage: string): Promise<ApiResponse<any>> {
    console.log('📝 Enrolling user with biometric');
    return this.request<any>('/auth/register-with-biometric', {
      method: 'POST',
      body: JSON.stringify({
        name,
        phoneNumber: phone,
        pin: password,
        palmImage
      })
    });
  }

  async createPaymentIntent(amount: number, description?: string): Promise<ApiResponse<PaymentIntent>> {
    console.log('💳 Creating payment intent:', amount);
    return this.request<PaymentIntent>('/payment/intent/create', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        description
      })
    });
  }

  async completePaymentIntent(intentId: string, palmImage?: string): Promise<ApiResponse<any>> {
    console.log('✅ Completing payment intent:', intentId);
    return this.request<any>('/payment/intent/complete', {
      method: 'POST',
      body: JSON.stringify({
        intentId,
        palmImage
      })
    });
  }

  async getPaymentIntents(limit = 10): Promise<ApiResponse<{ intents: PaymentIntent[]; total: number }>> {
    return this.request<{ intents: PaymentIntent[]; total: number }>(
      `/payment/intents?limit=${limit}`
    );
  }

  // ========== REGISTER METHOD ==========
  async register(
    name: string,
    email: string,
    phoneNumber: string,
    password: string
  ): Promise<ApiResponse<{ user: BackendUser; token: string }>> {
    console.log('📝 Register attempt:', email, phoneNumber);
    
    const response = await this.request<{ user: BackendUser; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phoneNumber, pin: password })
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      this.user = response.data.user;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('auth_user', JSON.stringify(this.user));
      console.log('✅ Registration successful:', this.user.name);
      
      // Show success toast
      toast.success('Registration successful!');
    } else {
      toast.error(response.error || 'Registration failed');
    }

    return response;
  }

async getProfile(): Promise<ApiResponse<BackendUser>> {
  return this.request<BackendUser>('/user/profile');
}

async enrollBiometricMulti(
  userId: string, 
  palmImages: string[], 
  handSide: string
): Promise<ApiResponse<any>> {
  console.log('🖐️ Enrolling multiple biometric images');
  return this.request<any>('/auth/enroll-biometric-multi', {
    method: 'POST',
    body: JSON.stringify({ 
      userId, 
      palmImages, 
      handSide 
    })
  });
}

  // ========== NEW TRANSACTION METHODS ==========
  async validatePhoneNumber(phoneNumber: string): Promise<ApiResponse<{
    exists: boolean;
    name?: string;
    currency?: string;
    isSelf?: boolean;
  }>> {
    return this.request(`/transactions/validate/${phoneNumber}`);
  }

  async sendMoney(
    receiverPhone: string,
    amount: number,
    description: string = ''
  ): Promise<ApiResponse<any>> {
    return this.request<any>('/transactions/send', {
      method: 'POST',
      body: JSON.stringify({
        receiverPhone,
        amount,
        description
      })
    });
  }

  async biometricPayment(
    amount: number,
    palmImage: string
  ): Promise<ApiResponse<any>> {
    return this.request<any>('/transactions/biometric-pay', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        palmImage
      })
    });
  }

  // ========== CORE REQUEST METHOD ==========
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isBiometric = false
  ): Promise<ApiResponse<T>> {
    this.requestCount++;
    const requestId = this.requestCount;
    
    const baseUrl = isBiometric ? BIOMETRIC_SERVICE_URL : API_BASE_URL;
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    console.log(`📡 [${requestId}] ${isBiometric ? 'BIOMETRIC' : 'BACKEND'} Request:`, {
      url,
      method: options.method || 'GET',
      endpoint,
      demoMode: this.isDemoMode
    });

    // If in demo mode, return mock for certain endpoints
    if (this.isDemoMode) {
      console.log(`🎭 [${requestId}] Using demo mode response`);
      return this.mockResponse<T>(endpoint, options, isBiometric);
    }

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // REMOVED: 'X-Request-ID': `req-${requestId}-${Date.now()}`,
        ...(this.token && !isBiometric ? { 'Authorization': `Bearer ${this.token}` } : {}),
        ...options.headers,
      };

      const fetchOptions: RequestInit = {
        ...options,
        headers,
        credentials: 'include',
        mode: 'cors',
      };

      // Add timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`⏰ [${requestId}] Request timeout`);
        controller.abort();
      }, 30000); // Reduced to 10 seconds
      
      fetchOptions.signal = controller.signal;

      const startTime = Date.now();
      const response = await fetch(url, fetchOptions);
      const duration = Date.now() - startTime;
      
      clearTimeout(timeoutId);

      console.log(`⏱️ [${requestId}] Response: ${response.status} (${duration}ms)`);

      // Handle response
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error(`❌ [${requestId}] JSON parse error:`, jsonError);
          const text = await response.text();
          console.log(`📄 [${requestId}] Raw response:`, text.substring(0, 200));
          data = { message: text, raw: text.substring(0, 200) };
        }
      } else {
        const text = await response.text();
        console.log(`📄 [${requestId}] Non-JSON response:`, text.substring(0, 200));
        data = { message: text, raw: text };
      }

      if (!response.ok) {
        console.error(`❌ [${requestId}] API Error (${response.status}):`, data);
        
        // Auto-logout on 401
        if (response.status === 401) {
          this.logout();
          toast.error('Session expired. Please login again.');
        }
        
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}`,
          message: data.message
        };
      }

      console.log(`✅ [${requestId}] API Success:`, data);
      return {
        success: true,
        data: data.data || data,
        message: data.message
      };
    } catch (error) {
      console.error(`🔥 [${requestId}] Request failed:`, error);
      
      // Network errors - use fallback for demo
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log(`🌐 [${requestId}] Network error, using demo fallback`);
        toast('Backend unavailable. Using demo mode.');
        return this.mockResponse<T>(endpoint, options, isBiometric);
      }
      
      // Abort errors
      if (error.name === 'AbortError') {
        console.log(`⏰ [${requestId}] Request timeout occurred`);
        toast.error('Request timeout. Server is not responding.');
        return {
          success: false,
          error: 'Request timeout. Server is not responding.',
          message: 'Timeout error'
        };
      }
      
      console.log(`❓ [${requestId}] Unknown error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Request failed'
      };
    }
  }

  // ========== MOCK RESPONSE GENERATORS ==========
  private mockResponse<T>(endpoint: string, options: RequestInit, isBiometric: boolean): ApiResponse<T> {
    console.log(`🎭 [Mock] Generating mock response for: ${endpoint}`);
    
    // REGISTER WITH BIOMETRIC ENDPOINT MOCK
    if (endpoint.includes('/auth/register-with-biometric')) {
      const mockUser: BackendUser = {
        id: 'user-demo-biometric-' + Date.now(),
        name: 'Demo Biometric User',
        email: 'biometric@palmpay.com',
        phoneNumber: '+92 331234567',
        balance: 1000.00,
        payId: 'PAYID-331234567',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        biometricEnrolled: true,
        biometricConfidence: 95
      };
      
      this.token = 'demo-jwt-token-biometric-' + Date.now();
      this.user = mockUser;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      
      return {
        success: true,
        data: {
          user: mockUser,
          token: this.token,
          biometricEnrolled: true
        } as any,
        message: 'Demo biometric registration successful'
      };
    }
    
    // ENROLL BIOMETRIC MOCK
    if (endpoint.includes('/auth/enroll-biometric')) {
      if (this.user) {
        this.user.biometricEnrolled = true;
        this.user.biometricConfidence = 95;
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      }
      
      return {
        success: true,
        data: {
          success: true,
          userId: this.user?.id || 'demo-user',
          confidence: 0.95,
          message: 'Mock biometric enrollment successful',
          biometricEnrolled: true
        } as any,
        message: 'Demo biometric enrollment successful'
      };
    }
    
    // BIOMETRIC LOGIN MOCK
    if (endpoint.includes('/auth/biometric-login')) {
      const mockUser: BackendUser = {
        id: 'user-demo-biometric',
        name: 'Demo Biometric User',
        email: 'biometric@palmpay.com',
        phoneNumber: '+971545449786',
        balance: 12450.00,
        payId: 'PAYID-545449786',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        biometricEnrolled: true,
        biometricConfidence: 95
      };
      
      this.token = 'demo-jwt-token-biometric';
      this.user = mockUser;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      
      return {
        success: true,
        data: {
          user: mockUser,
          token: this.token
        } as any,
        message: 'Demo biometric login successful'
      };
    }
    
    // REGISTER ENDPOINT MOCK
    if (endpoint.includes('/auth/register')) {
      const mockUser: BackendUser = {
        id: 'user-demo-register-' + Date.now(),
        name: 'Demo Registered User',
        email: 'registered@palmpay.com',
        phoneNumber: '+92 331234567',
        balance: 1000.00,
        payId: 'PAYID-331234567',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        biometricEnrolled: false
      };
      
      this.token = 'demo-jwt-token-register-' + Date.now();
      this.user = mockUser;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      
      return {
        success: true,
        data: {
          user: mockUser,
          token: this.token
        } as any,
        message: 'Demo registration successful'
      };
    }
    
    if (isBiometric) {
      return this.mockBiometricResponse<T>(endpoint, options);
    }
    
    // Mock responses for backend endpoints
    if (endpoint.includes('/auth/login')) {
      const mockUser: BackendUser = {
        id: 'user-demo-login',
        name: 'Demo User',
        email: 'demo@palmpay.com',
        phoneNumber: '+971545449786',
        balance: 12450.00,
        payId: 'PAYID-545449786',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        biometricEnrolled: true,
        biometricConfidence: 95
      };
      
      this.token = 'demo-jwt-token-login';
      this.user = mockUser;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      
      return {
        success: true,
        data: {
          user: mockUser,
          token: this.token
        } as any,
        message: 'Demo login successful'
      };
    }
    
    if (endpoint.includes('/transactions/balance')) {
      const balance = this.user?.balance || 12450.00;
      return {
        success: true,
        data: { 
          balance: balance, 
          currency: 'AED', 
          lastUpdated: new Date().toISOString() 
        } as any,
        message: 'Demo balance retrieved'
      };
    }
    
    if (endpoint.includes('/transactions/history')) {
      const mockTransactions: BackendTransaction[] = [
        {
          id: `tx-${Date.now()}-1`,
          senderId: 'sender-demo',
          receiverId: this.user?.id || 'user-demo',
          amount: 500.00,
          method: 'PALM',
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          description: 'Biometric payment at Dubai Mall'
        },
        {
          id: `tx-${Date.now()}-2`,
          senderId: this.user?.id || 'user-demo',
          receiverId: 'receiver-demo',
          amount: -200.00,
          method: 'PAYID',
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          description: 'Transfer to friend'
        }
      ];
      
      return {
        success: true,
        data: {
          transactions: mockTransactions,
          total: mockTransactions.length
        } as any,
        message: 'Demo transactions retrieved'
      };
    }
    
    if (endpoint.includes('/transactions/send')) {
      const mockTx: BackendTransaction = {
        id: `tx-mock-${Date.now()}`,
        senderId: this.user?.id || 'user-demo',
        receiverId: 'user-recipient',
        amount: 50.00,
        method: 'PAYID',
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Demo transaction'
      };
      
      // Update local balance in demo mode
      if (this.user) {
        this.user.balance -= 50.00;
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      }
      
      return {
        success: true,
        data: mockTx as any,
        message: 'Demo transaction successful'
      };
    }
    
    if (endpoint.includes('/transactions/validate/')) {
      const phone = endpoint.split('/').pop();
      return {
        success: true,
        data: {
          exists: true,
          name: 'Demo Recipient',
          currency: 'AED',
          isSelf: false
        } as any,
        message: 'Demo phone validation'
      };
    }
    
    if (endpoint.includes('/transactions/biometric-pay')) {
      const mockTx: BackendTransaction = {
        id: `bio-tx-${Date.now()}`,
        senderId: 'payer-demo',
        receiverId: this.user?.id || 'user-demo',
        amount: 100.00,
        method: 'PALM',
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Demo biometric palm payment'
      };
      
      // Update local balance
      if (this.user) {
        this.user.balance += 100.00;
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      }
      
      return {
        success: true,
        data: mockTx as any,
        message: 'Demo biometric payment successful'
      };
    }
    
    if (endpoint.includes('/payment/receive')) {
      const mockTx: BackendTransaction = {
        id: `receive-tx-${Date.now()}`,
        senderId: 'customer-demo',
        receiverId: this.user?.id || 'user-demo',
        amount: 75.00,
        method: 'PALM',
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Demo biometric payment received'
      };
      
      // Update local balance (merchant receives money)
      if (this.user) {
        this.user.balance += 75.00;
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      }
      
      return {
        success: true,
        data: mockTx as any,
        message: 'Demo biometric payment received successfully'
      };
    }
    
    if (endpoint.includes('/payment/intent/create')) {
      const mockIntent: PaymentIntent = {
        id: `intent-${Date.now()}`,
        merchantId: this.user?.id || 'merchant-demo',
        amount: 100.00,
        currency: 'AED',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 minutes
        createdAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: mockIntent as any,
        message: 'Demo payment intent created'
      };
    }
    
    if (endpoint.includes('/payment/intent/complete')) {
      return {
        success: true,
        data: {
          success: true,
          transactionId: `tx-completed-${Date.now()}`,
          message: 'Demo payment intent completed'
        } as any,
        message: 'Demo payment intent completed successfully'
      };
    }
    
    if (endpoint.includes('/user/profile')) {
      return {
        success: true,
        data: (this.user || {
          id: 'user-demo',
          name: 'Demo User',
          email: 'demo@palmpay.com',
          phoneNumber: '+971545449786',
          balance: 12450.00,
          payId: 'PAYID-545449786',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          biometricEnrolled: true,
          biometricConfidence: 95
        }) as any,
        message: 'Demo profile retrieved'
      };
    }
    
    if (endpoint.includes('/user/stats')) {
      return {
        success: true,
        data: {
          today: { income: 500, expenses: 0, net: 500, transactionCount: 3 },
          weekly: { income: 2840, expenses: 120, net: 2720, transactionCount: 15 },
          monthly: { income: 8150, expenses: 300, net: 7850, transactionCount: 48 },
          totalTransactions: 128,
          biometricEnrolled: this.user?.biometricEnrolled || false
        } as any,
        message: 'Demo stats retrieved'
      };
    }
    
    // Default mock response
    return {
      success: true,
      data: { 
        message: 'Demo response (service unavailable)',
        endpoint,
        timestamp: new Date().toISOString(),
        demo: true
      } as any,
      message: 'Demo mode active'
    };
  }

  private mockBiometricResponse<T>(endpoint: string, options: RequestInit): ApiResponse<T> {
    console.log('🤖 Mock biometric response');
    
    if (endpoint.includes('/biometric/verify')) {
      return {
        success: true,
        data: {
          success: true,
          userId: 'user-demo',
          confidence: 0.95,
          message: 'Mock biometric verification successful',
          verified: true
        } as any,
        message: 'Biometric verification successful (demo mode)'
      };
    }
    
    if (endpoint.includes('/biometric/identify')) {
      return {
        success: true,
        data: {
          success: true,
          user_id: 'payer-demo',
          confidence: 0.95,
          decision: 'VERIFIED',
          message: 'Mock biometric identification successful',
          demo: true
        } as any,
        message: 'Biometric identification successful (demo mode)'
      };
    }
    
    return {
      success: true,
      data: { 
        message: 'Mock biometric response',
        endpoint,
        demo: true
      } as any,
      message: 'Demo biometric response'
    };
  }

  // ========== EXISTING METHODS (KEEPING THESE) ==========
  async checkBackendHealth(): Promise<{ 
    success: boolean; 
    status?: string; 
    timestamp?: string; 
    version?: string;
    database?: boolean;
    uptime?: number;
  }> {
    try {
      console.log('🔍 Checking backend health...');
      
      const response = await fetch('http://localhost:3000/health', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Backend health:', data);
      return { success: true, ...data };
    } catch (error) {
      console.error('Backend health check failed:', error);
      return { 
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: false,
        uptime: 0
      };
    }
  }

  async login(phoneNumber: string, pin: string): Promise<ApiResponse<{ user: BackendUser; token: string }>> {
    console.log('🔐 Login attempt:', phoneNumber);
    
    const response = await this.request<{ user: BackendUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, pin })
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      this.user = response.data.user;
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('auth_user', JSON.stringify(this.user));
      console.log('✅ Login successful:', this.user.name);
      
      // Disable demo mode on successful real login
      this.disableDemoMode();
      toast.success('Login successful!');
    } else {
      toast.error(response.error || 'Login failed');
    }

    return response;
  }

  logout(): void {
    console.log('👋 Logging out');
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('demo_mode');
    toast.success('Logged out successfully');
  }

  async getBalance(): Promise<ApiResponse<{ balance: number; currency: string; lastUpdated: string }>> {
    return this.request<{ balance: number; currency: string; lastUpdated: string }>('/transactions/balance');
  }

  async getTransactions(limit = 10): Promise<ApiResponse<{ transactions: BackendTransaction[]; total: number }>> {
    return this.request<{ transactions: BackendTransaction[]; total: number }>(
      `/transactions/history?limit=${limit}`
    );
  }

  async getUserProfile(): Promise<ApiResponse<BackendUser>> {
    return this.request<BackendUser>('/user/profile');
  }

  async getUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      // Try to get real stats from backend
      const response = await this.request<UserStats>('/user/stats');
      
      if (response.success) {
        return response;
      }
      
      // Return default stats
      return {
        success: true,
        data: {
          today: { income: 500, expenses: 0, net: 500, transactionCount: 3 },
          weekly: { income: 2840, expenses: 120, net: 2720, transactionCount: 15 },
          monthly: { income: 8150, expenses: 300, net: 7850, transactionCount: 48 },
          totalTransactions: 128,
          biometricEnrolled: this.user?.biometricEnrolled || false
        }
      };
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      return {
        success: false,
        error: 'Failed to fetch statistics',
        message: 'Statistics unavailable'
      };
    }
  }

  async getDashboardData(): Promise<ApiResponse<{
    balance: number;
    recentTransactions: BackendTransaction[];
    stats: UserStats;
    user: BackendUser;
  }>> {
    try {
      const [balance, transactions, stats, user] = await Promise.all([
        this.getBalance(),
        this.getTransactions(5),
        this.getUserStats(),
        this.getUserProfile()
      ]);
      
      return {
        success: true,
        data: {
          balance: balance.success ? balance.data!.balance : 0,
          recentTransactions: transactions.success ? transactions.data!.transactions : [],
          stats: stats.success ? stats.data! : {
            today: { income: 0, expenses: 0, net: 0, transactionCount: 0 },
            weekly: { income: 0, expenses: 0, net: 0, transactionCount: 0 },
            monthly: { income: 0, expenses: 0, net: 0, transactionCount: 0 },
            totalTransactions: 0,
            biometricEnrolled: false
          },
          user: user.success ? user.data! : this.user!
        }
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      return {
        success: false,
        error: 'Failed to fetch dashboard data',
        message: 'Dashboard data unavailable'
      };
    }
  }

  // ========== UTILITY METHODS ==========
  enableDemoMode(): void {
    this.isDemoMode = true;
    localStorage.setItem('demo_mode', 'true');
    console.log('🎭 DEMO MODE ENABLED - Using mock responses where needed');
    toast('Demo mode enabled - Using mock data');
  }

  disableDemoMode(): void {
    this.isDemoMode = false;
    localStorage.removeItem('demo_mode');
    console.log('✅ Demo mode disabled');
    toast('Demo mode disabled');
  }

  isInDemoMode(): boolean {
    return this.isDemoMode;
  }

  // ========== GETTERS ==========
  getToken(): string | null {
    return this.token;
  }

  getUser(): BackendUser | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  isBiometricEnrolled(): boolean {
    if (!this.user) return false;
    return this.user.biometricEnrolled || false;
  }

  getApiBaseUrl(): string {
    return API_BASE_URL;
  }

  getBiometricUrl(): string {
    return BIOMETRIC_SERVICE_URL;
  }
}

// ========== EXPORTS ==========
export const apiService = new ApiService();

// Mock compatibility functions
export const scanPalm = () => apiService.request<any>('/biometric/identify', {
  method: 'POST',
  body: JSON.stringify({ palmImage: 'mock_image_base64' })
}, true);

export const verifyPin = (pin: string) => Promise.resolve(pin.length >= 4);

export const getTransactions = () => apiService.getTransactions();

export type { Transaction, ServiceStatus, UserStats, HealthStatus };
