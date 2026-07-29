import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.biometricSession.deleteMany();
  await prisma.biometricProfile.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  // Create system user for receiving money
  const systemUser = await prisma.user.create({
    data: {
      name: 'PalmPay System',
      email: 'system@palm-pay.com',
      phoneNumber: '0000000000',
      pinHash: await bcrypt.hash('0000', 10),
      balance: 1000000,
      wallet: {
        create: {
          balance: 1000000
        }
      }
    }
  });

  console.log(`✅ Created system user: ${systemUser.name}`);

  // Create test users
  const testUsers = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '1234567890',
      pin: '1234',
      initialBalance: 5000
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phoneNumber: '0987654321',
      pin: '5678',
      initialBalance: 3000
    },
    {
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      phoneNumber: '5551234567',
      pin: '9999',
      initialBalance: 10000
    }
  ];

  const createdUsers = [];

  for (const userData of testUsers) {
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        pinHash: await bcrypt.hash(userData.pin, 10),
        balance: userData.initialBalance,
        wallet: {
          create: {
            balance: userData.initialBalance
          }
        }
      }
    });

    createdUsers.push(user);
    console.log(`✅ Created user: ${user.name} (${user.phoneNumber})`);
  }

  // Create sample transactions
  if (createdUsers.length >= 2) {
    const sampleTransactions = [
      {
        sender: createdUsers[0],
        receiver: createdUsers[1],
        amount: 500,
        method: 'PAYID' as const
      },
      {
        sender: createdUsers[1],
        receiver: createdUsers[0],
        amount: 300,
        method: 'PALM' as const
      },
      {
        sender: createdUsers[0],
        receiver: systemUser,
        amount: 1000,
        method: 'PAYID' as const
      }
    ];

    for (const tx of sampleTransactions) {
      await prisma.transaction.create({
        data: {
          senderId: tx.sender.id,
          receiverId: tx.receiver.id,
          amount: tx.amount,
          method: tx.method,
          status: 'COMPLETED'
        }
      });

      console.log(`✅ Created transaction: ${tx.amount} from ${tx.sender.name} to ${tx.receiver.name}`);
    }
  }

  // Create sample biometric sessions
  for (const user of createdUsers) {
    const sessions = [
      { confidence: 0.92, decision: 'APPROVED' as const },
      { confidence: 0.78, decision: 'PIN_REQUIRED' as const },
      { confidence: 0.45, decision: 'REJECTED' as const }
    ];

    for (const session of sessions) {
      await prisma.biometricSession.create({
        data: {
          userId: user.id,
          confidence: session.confidence,
          decision: session.decision
        }
      });
    }

    console.log(`✅ Created biometric sessions for: ${user.name}`);
  }

  // Create sample audit logs
  for (const user of createdUsers) {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        details: {
          email: user.email,
          phoneNumber: user.phoneNumber,
          timestamp: new Date().toISOString()
        }
      }
    });

    console.log(`✅ Created audit log for: ${user.name}`);
  }

  console.log('\n🎉 Database seeding completed!');
  console.log('\n🔑 Test Credentials:');
  console.log('===================');
  testUsers.forEach(user => {
    console.log(`📱 Phone: ${user.phoneNumber}, PIN: ${user.pin}`);
  });
  console.log('\n🚀 Server is ready!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });