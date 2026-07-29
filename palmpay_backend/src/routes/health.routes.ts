// File: palmpay_backend/src/routes/health.routes.ts
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      database: 'connected',
      services: {
        backend: true,
        biometric: false, // You can check biometric service if needed
        database: true
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      database: 'disconnected',
      services: {
        backend: true,
        biometric: false,
        database: false
      },
      error: 'Database connection failed'
    });
  }
});

export default router;