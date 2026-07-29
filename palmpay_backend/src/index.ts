import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import transactionRoutes from './routes/transaction.routes';
import healthRoutes from './routes/health.routes';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://192.168.1.205:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== REQUEST LOGGER ====================
const requestLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  const requestId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  
  (req as any).requestId = requestId;
  
  console.log(`➡️ [${requestId}] ${req.method} ${req.originalUrl} at ${new Date().toISOString()}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    const logBody = { ...req.body };
    if (logBody.pin) logBody.pin = '***';
    if (logBody.password) logBody.password = '***';
    if (logBody.palmImage) logBody.palmImage = '[BASE64_IMAGE]';
    
    console.log(`📦 [${requestId}] Body:`, JSON.stringify(logBody, null, 2));
  }
  
  const originalSend = res.send.bind(res);
  res.send = function(body: any) {
    const duration = Date.now() - start;
    console.log(`⬅️ [${requestId}] Response in ${duration}ms - Status: ${res.statusCode}`);
    
    if (res.statusCode >= 400) {
      console.error(`❌ [${requestId}] Error response:`, typeof body === 'string' ? body.substring(0, 500) : JSON.stringify(body));
    }
    
    return originalSend(body);
  };
  
  next();
};
app.use(requestLogger);

// ==================== HEALTH CHECK ====================
app.get('/', (req, res) => {
  res.json({
    message: 'PalmPay Quantum API - PRESENTATION MODE',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    presentationMode: true
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    database: 'connected',
    services: {
      backend: true,
      biometric: false,
      database: true
    }
  });
});

// ==================== DEMO ACCOUNT INITIALIZATION ====================
async function initializeDemoAccounts() {
  console.log('\n🎯 ==================== PALMPAY PRESENTATION SETUP ====================');
  
  try {
    // ✅ Account A: +971568100583 (Logged in user - Receiver)
    const accountA = {
      name: 'Demo User 1',
      email: 'user1@palmpay.com',
      phoneNumber: '+971568100583',
      password: await bcrypt.hash('123456', 10),
      balance: 5000.00
    };
    
    // ✅ Account B: +971545449786 (Payer - Always pays to Account A)
    const accountB = {
      name: 'Demo Payer',
      email: 'payer@palmpay.com',
      phoneNumber: '+971545449786',
      password: await bcrypt.hash('demo123', 10),
      balance: 100000.00
    };
    
    console.log('👤 Setting up demo accounts for presentation...');
    
    for (const account of [accountA, accountB]) {
      const existing = await prisma.user.findFirst({
        where: { phoneNumber: account.phoneNumber }
      });
      
      if (!existing) {
        await prisma.user.create({
          data: {
            name: account.name,
            email: account.email,
            phoneNumber: account.phoneNumber,
            password: account.password,
            balance: account.balance
          }
        });
        console.log(`   ✅ Created: ${account.name} (${account.phoneNumber}) - AED ${account.balance}`);
      } else {
        await prisma.user.update({
          where: { phoneNumber: account.phoneNumber },
          data: { 
            balance: account.balance,
            name: account.name,
            email: account.email
          }
        });
        console.log(`   ✅ Updated: ${account.name} (${account.phoneNumber}) - Balance: AED ${account.balance}`);
      }
    }
    
    console.log('\n🎯 PRESENTATION ACCOUNTS READY:');
    console.log('   Account A (+971568100583): Receiver - AED 5,000');
    console.log('   Account B (+971545449786): Payer - AED 100,000');
    console.log('\n🎯 PRESENTATION FLOW:');
    console.log('   1. Login with Account A (+971568100583 / 123456)');
    console.log('   2. Go to "Receive Payment"');
    console.log('   3. Enter amount (e.g., 250)');
    console.log('   4. Scan palm (any image works)');
    console.log('   5. Money transfers from Account B to Account A');
    console.log('   6. Check dashboard for updated balance');
    console.log('===========================================================\n');
    
  } catch (error) {
    console.error('❌ Error initializing demo accounts:', error);
  }
}

// ==================== PRESENTATION DEBUG ENDPOINTS ====================
app.get('/api/v1/presentation/setup', async (req, res) => {
  try {
    await initializeDemoAccounts();
    res.json({
      success: true,
      message: 'Presentation accounts initialized',
      accounts: [
        { name: 'Demo User 1', phone: '+971568100583', role: 'Receiver', balance: 5000 },
        { name: 'Demo Payer', phone: '+971545449786', role: 'Payer', balance: 100000 }
      ]
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/v1/presentation/accounts', async (req, res) => {
  try {
    const accounts = await prisma.user.findMany({
      where: {
        phoneNumber: {
          in: ['+971568100583', '+971545449786']
        }
      },
      select: {
        name: true,
        email: true,
        phoneNumber: true,
        balance: true
      }
    });
    
    res.json({
      success: true,
      data: accounts,
      presentationMode: true
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== REGULAR ROUTES ====================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/transactions', transactionRoutes);

// ==================== ERROR HANDLING ====================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const requestId = (req as any).requestId || 'unknown';
  console.error(`🔥 [${requestId}] Error:`, err.stack);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    requestId,
    presentationMode: true
  });
});

// ==================== 404 HANDLER ====================
app.use('*', (req, res) => {
  const requestId = (req as any).requestId || 'unknown';
  console.log(`❓ [${requestId}] 404 - Endpoint not found: ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET  /',
      'GET  /health',
      'GET  /api/v1/presentation/setup',
      'GET  /api/v1/presentation/accounts',
      'POST /api/v1/auth/register',
      'POST /api/v1/auth/login',
      'POST /api/v1/auth/register-with-biometric',
      'POST /api/v1/auth/enroll-biometric',
      'GET  /api/v1/user/profile',
      'GET  /api/v1/transactions/balance',
      'GET  /api/v1/transactions/history',
      'POST /api/v1/transactions/send',
      'POST /api/v1/transactions/biometric-pay'
    ],
    requestId,
    presentationMode: true
  });
});

// ==================== SERVER START ====================
app.listen(PORT, async () => {
  try {
    console.log('\n🚀 ==================== PALMPAY QUANTUM BACKEND ====================');
    console.log('🔌 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Initialize demo accounts for presentation
    await initializeDemoAccounts();
    
    console.log(`\n🚀 Backend running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔑 API Base: http://localhost:${PORT}/api/v1`);
    console.log(`🎯 Presentation setup: http://localhost:${PORT}/api/v1/presentation/setup`);
    console.log(`📅 Server started: ${new Date().toISOString()}`);
    console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`👤 Process ID: ${process.pid}`);
    console.log('================================================================\n');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
});

// ==================== GRACEFUL SHUTDOWN ====================
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await prisma.$disconnect();
  console.log('✅ Database connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down...');
  await prisma.$disconnect();
  console.log('✅ Database connection closed');
  process.exit(0);
});

export { app, prisma };