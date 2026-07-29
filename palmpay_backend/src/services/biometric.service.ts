// src/services/biometric.service.ts (Production)
import axios from 'axios';
import FormData from 'form-data';

export interface BiometricUser {
  user_id: string;
  phone_number: string;
  name: string;
  confidence: number;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data: {
    user_id: string;
    phone_number: string;
    name: string;
    hand_side: string;
    registered_at: string;
  };
}

export interface VerificationResponse {
  success: boolean;
  verified: boolean;
  data?: BiometricUser;
  confidence?: number;
  error?: string;
}

export class BiometricService {
  private pythonServiceUrl: string;

  constructor() {
    this.pythonServiceUrl = process.env.PYTHON_BIOMETRIC_SERVICE_URL || 'http://localhost:5001';
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.pythonServiceUrl}/health`);
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Biometric service health check failed:', error);
      return false;
    }
  }

  async registerUser(
    userId: string,
    phoneNumber: string,
    name: string,
    imageBase64: string
  ): Promise<RegistrationResponse> {
    try {
      const response = await axios.post(
        `${this.pythonServiceUrl}/register`,
        {
          user_id: userId,
          phone_number: phoneNumber,
          name: name,
          image: imageBase64
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Biometric registration error:', error.response?.data || error.message);
      return {
        success: false,
        message: error.response?.data?.error || 'Biometric registration failed',
        data: null as any
      };
    }
  }

  async verifyPalm(imageBase64: string): Promise<VerificationResponse> {
    try {
      const response = await axios.post(
        `${this.pythonServiceUrl}/verify`,
        {
          image: imageBase64
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 15000 // 15 seconds timeout
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Biometric verification error:', error.response?.data || error.message);
      return {
        success: false,
        verified: false,
        error: error.response?.data?.error || 'Biometric verification failed'
      };
    }
  }

  async processBiometricPayment(
    imageBase64: string,
    amount: number
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.pythonServiceUrl}/payment`,
        {
          image: imageBase64,
          amount: amount
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 20000 // 20 seconds timeout
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Biometric payment error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Biometric payment failed');
    }
  }
}

// Singleton instance
export const biometricService = new BiometricService();