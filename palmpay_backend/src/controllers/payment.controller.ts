// src/controllers/payment.controller.ts (NEW FILE)
import { Request, Response } from 'express';
import prisma from '../config/database';
import { biometricService } from '../services/biometric.service';

export class PaymentController {
  static async receivePayment(req: Request, res: Response) {
    const t = await prisma.$transaction();
    
    try {
      const merchant = (req as any).user; // Merchant who's receiving payment
      const { amount, customerPalmImage } = req.body;

      if (!amount || !customerPalmImage) {
        return res.status(400).json({
          success: false,
          error: 'Amount and customer palm image are required'
        });
      }

      // Step 1: Verify customer's palm
      console.log('Verifying customer palm...');
      const verificationResult = await biometricService.verifyPalm(customerPalmImage);

      if (!verificationResult.success || !verificationResult.verified) {
        return res.status(401).json({
          success: false,
          error: 'Customer authentication failed',
          details: verificationResult.error || 'Palm not recognized'
        });
      }

      const customerData = verificationResult.data!;
      console.log('Customer verified:', customerData.name);

      // Step 2: Get customer and merchant from database
      const [customer, merchantUser] = await Promise.all([
        prisma.user.findUnique({
          where: { id: customerData.user_id },
          transaction: t
        }),
        prisma.user.findUnique({
          where: { id: merchant.id },
          transaction: t
        })
      ]);

      if (!customer) {
        await t.$rollback();
        return res.status(404).json({
          success: false,
          error: 'Customer account not found'
        });
      }

      if (!merchantUser) {
        await t.$rollback();
        return res.status(404).json({
          success: false,
          error: 'Merchant account not found'
        });
      }

      // Step 3: Check customer balance
      if (customer.balance < amount) {
        await t.$rollback();
        return res.status(400).json({
          success: false,
          error: 'Customer has insufficient balance',
          customerBalance: customer.balance
        });
      }

      // Step 4: Process transaction
      await prisma.user.update({
        where: { id: customer.id },
        data: { balance: customer.balance - amount },
        transaction: t
      });

      await prisma.user.update({
        where: { id: merchant.id },
        data: { balance: merchantUser.balance + amount },
        transaction: t
      });

      // Step 5: Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          senderId: customer.id,
          receiverId: merchant.id,
          amount: amount,
          type: 'BIOMETRIC_PAYMENT',
          status: 'COMPLETED',
          biometricVerified: true,
          biometricConfidence: customerData.confidence,
          description: `Biometric payment to ${merchantUser.name}`,
          metadata: {
            biometricMatch: {
              confidence: customerData.confidence,
              method: 'palm_verification'
            }
          }
        },
        transaction: t
      });

      // Step 6: Create audit logs
      await Promise.all([
        prisma.auditLog.create({
          data: {
            userId: customer.id,
            action: 'BIOMETRIC_PAYMENT_SENT',
            details: {
              amount: amount,
              to: merchantUser.name,
              transactionId: transaction.id,
              timestamp: new Date().toISOString()
            }
          },
          transaction: t
        }),
        prisma.auditLog.create({
          data: {
            userId: merchant.id,
            action: 'BIOMETRIC_PAYMENT_RECEIVED',
            details: {
              amount: amount,
              from: customer.name,
              transactionId: transaction.id,
              timestamp: new Date().toISOString()
            }
          },
          transaction: t
        })
      ]);

      await t.$commit();

      res.status(200).json({
        success: true,
        data: {
          transactionId: transaction.id,
          amount: amount,
          customer: {
            name: customer.name,
            phone: customer.phoneNumber
          },
          merchant: {
            name: merchantUser.name,
            newBalance: merchantUser.balance + amount
          },
          biometric: {
            verified: true,
            confidence: customerData.confidence,
            method: 'palm_recognition'
          },
          timestamp: new Date().toISOString()
        },
        message: `Payment of AED ${amount} received from ${customer.name}`
      });

    } catch (error: any) {
      await t.$rollback();
      console.error('Biometric payment error:', error);
      res.status(500).json({
        success: false,
        error: 'Payment processing failed. Please try again.'
      });
    }
  }

  static async getPaymentQR(req: Request, res: Response) {
    try {
      const merchant = (req as any).user;
      const { amount } = req.body;

      // Generate a unique payment link/QR code
      const paymentId = `PAY${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      // Store payment intent (in production, use Redis)
      const paymentIntent = {
        id: paymentId,
        merchantId: merchant.id,
        amount: amount,
        status: 'PENDING',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      };

      // Return QR code data
      res.status(200).json({
        success: true,
        data: {
          paymentId: paymentId,
          amount: amount,
          merchantName: merchant.name,
          qrData: `palmpay://payment/${paymentId}`,
          expiresAt: paymentIntent.expiresAt
        }
      });

    } catch (error: any) {
      console.error('QR generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate payment QR'
      });
    }
  }
}