import { Request, Response } from 'express';
import { AuthServiceHandler } from '../services/auth.service';
import { BiometricService } from '../services/biometric.service';

export class AuthController {
  static async register(req: Request, res: Response) {
    console.log('🔵 [AUTH] Register endpoint called at:', new Date().toISOString());
    console.log('📦 Request body:', JSON.stringify(req.body));
    
    try {
      const { name, email, phoneNumber, pin } = req.body;
      
      console.log('🔍 [AUTH] Calling AuthServiceHandler.registerUser...');
      const startTime = Date.now();
      
      const result = await AuthServiceHandler.registerUser(
        name,
        email,
        phoneNumber,
        pin
      );
      
      const duration = Date.now() - startTime;
      console.log(`✅ [AUTH] AuthServiceHandler.registerUser completed in ${duration}ms`);
      console.log('📊 Result:', JSON.stringify(result, null, 2));

      res.status(201).json({
        success: true,
        data: result,
        debug: { duration: `${duration}ms` }
      });
    } catch (error: any) {
      console.error('❌ [AUTH] Register error:', error);
      console.error('🔍 Error stack:', error.stack);
      
      res.status(400).json({
        success: false,
        error: error.message,
        debug: { stack: process.env.NODE_ENV === 'development' ? error.stack : undefined }
      });
    }
  }

  static async registerWithBiometric(req: Request, res: Response) {
    console.log('🔵 [AUTH] Register with biometric (PRESENTATION MODE)');
    console.log('📦 Request body:', {
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      pinLength: req.body.pin?.length || 0,
      palmImage: req.body.palmImage ? '[BASE64_IMAGE_HIDDEN]' : 'none'
    });
    
    try {
      const { name, email, phoneNumber, pin, palmImage } = req.body;
      
      console.log('👤 Creating user WITHOUT biometric enrollment');
      console.log('🚫 Palm images will be DISCARDED for presentation');
      
      // Register user (palmImage is IGNORED)
      const result = await AuthServiceHandler.registerUser(
        name,
        email,
        phoneNumber,
        pin
      );

      console.log(`✅ User created: ${result.user.name} (${result.user.phoneNumber})`);
      console.log('🎯 FOR PRESENTATION: Biometric enrollment skipped');

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          token: result.token,
          biometricEnrolled: false,
          presentationMode: true,
          message: 'Registration successful (biometric skipped for presentation)'
        }
      });
    } catch (error: any) {
      console.error('❌ Registration with biometric error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { phoneNumber, pin } = req.body;
      
      const result = await AuthServiceHandler.loginUser(phoneNumber, pin);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  static async biometricLogin(req: Request, res: Response) {
    try {
      const { palmImage } = req.body;
      
      const result = await BiometricService.verifyPalm(palmImage);

      if (!result.success || !result.userId) {
        return res.status(401).json({
          success: false,
          error: 'Biometric verification failed'
        });
      }

      // Generate session/token for the user
      const authResult = await AuthServiceHandler.generateToken(result.userId);

      res.status(200).json({
        success: true,
        data: authResult
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  static async profile(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async enrollBiometric(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { palmImage } = req.body;

      if (!palmImage) {
        return res.status(400).json({
          success: false,
          error: 'Palm image is required'
        });
      }

      // For presentation, just simulate success without storing
      console.log('🎯 PRESENTATION: Biometric enrollment simulated (not stored)');
      
      res.status(200).json({
        success: true,
        data: {
          success: true,
          userId,
          confidence: 0.95,
          message: 'Biometric enrollment successful (simulated for presentation)',
          biometricEnrolled: false // Set to false since we're not actually storing
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}