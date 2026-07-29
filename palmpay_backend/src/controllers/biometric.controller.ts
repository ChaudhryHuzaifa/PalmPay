import { Request, Response } from 'express';
import { BiometricService } from '../services/biometric.service';

export class BiometricController {
  static async enroll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { palmImage, handSide, pin } = req.body;
      
      const profile = await BiometricService.enrollBiometric(
        userId,
        palmImage,
        handSide,
        pin
      );

      res.status(201).json({
        success: true,
        data: profile
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async verify(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { palmImage } = req.body;
      
      const session = await BiometricService.verifyBiometric(userId, palmImage);

      res.status(200).json({
        success: true,
        data: session
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async identify(req: Request, res: Response) {
    try {
      const { palmImage } = req.body;
      
      const userId = await BiometricService.identifyUser(palmImage);

      res.status(200).json({
        success: true,
        data: { userId }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getSessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const sessions = await BiometricService.getBiometricSessions(userId, limit);

      res.status(200).json({
        success: true,
        data: sessions
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}