import axios, { AxiosInstance } from 'axios';
import { FASTAPI_SERVICE } from '../config/constants';
import logger from './logger';

class FastAPIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: FASTAPI_SERVICE.URL,
      timeout: FASTAPI_SERVICE.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

    async registerBiometric(
    userId: string, 
    palmImages: string[], 
    handSide: string
  ): Promise<any> {
    try {
      const response = await this.client.post(FASTAPI_SERVICE.ENDPOINTS.REGISTER, {
        user_id: userId,
        palm_images: palmImages, // Array of base64 images
        hand_side: handSide
      });
      return response.data;
    } catch (error: any) {
      logger.error(`Biometric registration failed: ${error.message}`);
      throw new Error(`Biometric service error: ${error.message}`);
    }
  }

  async identifyBiometric(palmImage: string): Promise<any> {
    try {
      const response = await this.client.post(FASTAPI_SERVICE.ENDPOINTS.IDENTIFY, {
        palm_image: palmImage
      });
      return response.data;
    } catch (error: any) {
      logger.error(`Biometric identification failed: ${error.message}`);
      throw new Error(`Biometric service error: ${error.message}`);
    }
  }
}

export default new FastAPIClient();