import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ✅ FIXED: Get user balance
export const getBalance = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Please login to continue'
      });
    }

    // Get user with balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        balance: true,
        name: true,
        phoneNumber: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        balance: Number(user.balance),
        aed: Number(user.balance),
        usd: (Number(user.balance) / 3.67).toFixed(2),
        currency: 'AED',
        user: {
          name: user.name,
          phoneNumber: user.phoneNumber
        }
      }
    });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch balance'
    });
  }
};

// ✅ FIXED: Get transaction history
export const getHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    // Get transactions where user is sender or receiver
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ],
          status: 'COMPLETED'
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          sender: {
            select: {
              name: true,
              phoneNumber: true
            }
          },
          receiver: {
            select: {
              name: true,
              phoneNumber: true
            }
          }
        }
      }),
      prisma.transaction.count({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ],
          status: 'COMPLETED'
        }
      })
    ]);

    // Format transactions for frontend
    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      amount: Number(tx.amount),
      type: tx.senderId === userId ? 'SENT' : 'RECEIVED',
      transactionType: tx.transactionType,
      status: tx.status,
      category: tx.category,
      description: tx.description,
      sender: {
        name: tx.sender?.name,
        phoneNumber: tx.sender?.phoneNumber
      },
      receiver: {
        name: tx.receiver?.name,
        phoneNumber: tx.receiver?.phoneNumber
      },
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt
    }));

    res.json({
      success: true,
      data: {
        transactions: formattedTransactions,
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction history'
    });
  }
};

// ✅ NEW: Get transaction summary
export const getSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all transactions for user
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ],
        status: 'COMPLETED'
      }
    });

    // Calculate stats
    const todayTx = transactions.filter(tx => 
      new Date(tx.createdAt) >= startOfDay
    );
    const weeklyTx = transactions.filter(tx => 
      new Date(tx.createdAt) >= startOfWeek
    );
    const monthlyTx = transactions.filter(tx => 
      new Date(tx.createdAt) >= startOfMonth
    );

    const calculateStats = (txList: any[]) => {
      const sent = txList
        .filter(tx => tx.senderId === userId)
        .reduce((sum, tx) => sum + Number(tx.amount), 0);
      
      const received = txList
        .filter(tx => tx.receiverId === userId)
        .reduce((sum, tx) => sum + Number(tx.amount), 0);
      
      return {
        sent,
        received,
        net: received - sent,
        count: txList.length
      };
    };

    const todayStats = calculateStats(todayTx);
    const weeklyStats = calculateStats(weeklyTx);
    const monthlyStats = calculateStats(monthlyTx);
    const allTimeStats = calculateStats(transactions);

    res.json({
      success: true,
      data: {
        today: {
          income: todayStats.received,
          expenses: todayStats.sent,
          net: todayStats.net,
          transactions: todayStats.count
        },
        weekly: {
          income: weeklyStats.received,
          expenses: weeklyStats.sent,
          net: weeklyStats.net,
          transactions: weeklyStats.count
        },
        monthly: {
          income: monthlyStats.received,
          expenses: monthlyStats.sent,
          net: monthlyStats.net,
          transactions: monthlyStats.count
        },
        allTime: {
          totalSent: allTimeStats.sent,
          totalReceived: allTimeStats.received,
          net: allTimeStats.net,
          transactionCount: allTimeStats.count
        }
      }
    });
  } catch (error) {
    console.error('Transaction summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction summary'
    });
  }
};

// ✅ FIXED: Validate phone number
export const validatePhone = async (req: Request, res: Response) => {
  try {
    let { phoneNumber } = req.params;
    const senderId = (req as any).user?.id;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number required'
      });
    }

    // Ensure phone number has + prefix
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = `+${phoneNumber}`;
    }

    console.log(`Validating phone: ${phoneNumber}, senderId: ${senderId}`);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
      select: {
        id: true,
        name: true,
        phoneNumber: true
      }
    });

    if (!user) {
      return res.json({
        success: true,
        data: {
          exists: false,
          message: 'No user found with this number'
        }
      });
    }

    // Check if it's the same user
    if (user.id === senderId) {
      return res.json({
        success: true,
        data: {
          exists: true,
          name: user.name,
          isSelf: true,
          message: 'You cannot send money to yourself'
        }
      });
    }

    return res.json({
      success: true,
      data: {
        exists: true,
        name: user.name,
        currency: 'AED'
      }
    });

  } catch (error) {
    console.error('Phone validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Validation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// ✅ FIXED: Send money
export const sendMoney = async (req: Request, res: Response) => {
  try {
    let { receiverPhone, amount, description = '' } = req.body;
    const senderId = (req as any).user?.id;

    if (!senderId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Please login to continue'
      });
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Amount must be greater than 0'
      });
    }

    // Ensure receiver phone has + prefix
    if (!receiverPhone.startsWith('+')) {
      receiverPhone = `+${receiverPhone}`;
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { phoneNumber: receiverPhone }
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user found with this phone number'
      });
    }

    // Check if sender is trying to send to themselves
    if (senderId === receiver.id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipient',
        message: 'You cannot send money to yourself'
      });
    }

    // Check sender balance
    const sender = await prisma.user.findUnique({
      where: { id: senderId }
    });

    if (!sender) {
      return res.status(404).json({
        success: false,
        error: 'Sender not found',
        message: 'Your account was not found'
      });
    }

    const senderBalance = parseFloat(sender.balance.toString());
    
    if (senderBalance < amountNum) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient funds',
        message: `Your balance is AED ${senderBalance.toFixed(2)}`
      });
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update sender balance
      await tx.user.update({
        where: { id: senderId },
        data: {
          balance: {
            decrement: amountNum
          }
        }
      });

      // Update receiver balance
      await tx.user.update({
        where: { id: receiver.id },
        data: {
          balance: {
            increment: amountNum
          }
        }
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          amount: amountNum,
          senderId: senderId,
          receiverId: receiver.id,
          status: "COMPLETED",
          method: "PAYID",
          transactionType: "transfer",
          category: "transfer",
          description: description,
        },
        include: {
          sender: {
            select: { name: true }
          },
          receiver: {
            select: { name: true }
          }
        }
      });

      return transaction;
    });

    // Get updated sender balance
    const updatedSender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { balance: true }
    });

    res.json({
      success: true,
      data: {
        id: result.id,
        amount: result.amount,
        type: result.transactionType,
        status: result.status,
        description: result.description,
        senderName: result.sender.name,
        receiverName: result.receiver.name,
        createdAt: result.createdAt,
        newBalance: updatedSender ? Number(updatedSender.balance) : senderBalance - amountNum
      },
      message: `AED ${amountNum.toFixed(2)} sent successfully to ${receiver.name}`
    });

  } catch (error) {
    console.error('Send money error:', error);
    res.status(500).json({
      success: false,
      error: 'Transaction failed',
      message: 'Could not complete the transaction. Please try again.'
    });
  }
};

// ✅ UPDATED: Biometric payment - PRESENTATION MODE (FIXED: Removed location field)
export const biometricPayment = async (req: Request, res: Response) => {
  try {
    const { amount, palmImage } = req.body;
    const receiverId = (req as any).user?.id;

    if (!receiverId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Please login to continue'
      });
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Amount must be greater than 0'
      });
    }

    console.log('🎯 [PRESENTATION] Biometric payment requested');
    console.log(`   Amount: AED ${amountNum}`);
    console.log(`   Receiver ID: ${receiverId}`);
    console.log('🖐️ Palm image captured (ignored for presentation)');

    // Get receiver info
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: 'Receiver not found',
        message: 'Your account was not found'
      });
    }

    console.log(`👤 Receiver: ${receiver.name} (${receiver.phoneNumber})`);

    // ✅ HARDCODED PAYER FOR PRESENTATION: +971545449786
    const payerPhone = '+971545449786';
    let payer = await prisma.user.findFirst({
      where: { phoneNumber: payerPhone }
    });

    // If payer doesn't exist, create it
    if (!payer) {
      console.log('👤 Creating presentation payer account...');
      payer = await prisma.user.create({
        data: {
          name: 'Demo Payer',
          email: 'payer@palmpay.com',
          phoneNumber: payerPhone,
          password: await bcrypt.hash('demo123', 10),
          balance: 100000
        }
      });
      console.log(`✅ Created payer: ${payer.name} (${payer.phoneNumber})`);
    }

    // Check payer balance
    const payerBalance = parseFloat(payer.balance.toString());
    console.log(`💰 Payer balance: AED ${payerBalance}`);
    
    // Ensure payer has enough money
    if (payerBalance < amountNum) {
      console.log('⚠️ Adding funds to payer for presentation...');
      await prisma.user.update({
        where: { id: payer.id },
        data: { balance: 100000 }
      });
    }

    // ✅ Process transaction: From Fixed Payer to Logged-in User
    console.log('🔄 Processing presentation transaction...');
    const result = await prisma.$transaction(async (tx) => {
      // Update payer balance (decrement)
      await tx.user.update({
        where: { id: payer.id },
        data: { balance: { decrement: amountNum } }
      });

      // Update receiver balance (increment)
      await tx.user.update({
        where: { id: receiverId },
        data: { balance: { increment: amountNum } }
      });

      // Create transaction record (FIXED: Removed location field)
      const transaction = await tx.transaction.create({
        data: {
          amount: amountNum,
          senderId: payer.id,
          receiverId,
          status: 'COMPLETED',
          transactionType: 'BIOMETRIC_PAYMENT',
          category: 'palm_payment',
          description: `Palm payment to ${receiver.name}`,
          method: 'PALM'
        },
        include: {
          sender: { 
            select: { name: true, phoneNumber: true, email: true } 
          },
          receiver: { 
            select: { name: true, phoneNumber: true, email: true } 
          }
        }
      });

      return transaction;
    });

    // Get updated balances
    const updatedReceiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { balance: true }
    });

    console.log('✅ Presentation transaction completed!');
    console.log(`📊 New receiver balance: AED ${updatedReceiver?.balance}`);

    res.json({
      success: true,
      data: {
        id: result.id,
        amount: amountNum,
        type: 'BIOMETRIC_PAYMENT',
        status: 'COMPLETED',
        payer: {
          name: result.sender.name,
          phoneNumber: result.sender.phoneNumber,
          email: result.sender.email
        },
        receiver: {
          name: result.receiver.name,
          phoneNumber: result.receiver.phoneNumber,
          email: result.receiver.email
        },
        biometricConfidence: 0.95,
        timestamp: new Date().toISOString(),
        newBalance: updatedReceiver ? Number(updatedReceiver.balance) : 0,
        presentationMode: true,
        debugInfo: {
          payerAccount: '+971545449786',
          receiverAccount: receiver.phoneNumber,
          palmImageUsed: false
        }
      },
      message: `✅ Payment of AED ${amountNum.toFixed(2)} received from ${result.sender.name} via palm recognition`
    });

  } catch (error) {
    console.error('❌ Biometric payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment failed',
      message: 'Could not complete the payment. Please try again.',
      details: error.message
    });
  }
};

// ✅ ADDED: Presentation mode receive payment endpoint
export const presentationReceivePayment = async (req: Request, res: Response) => {
  try {
    const { amount, merchantPhone } = req.body;
    const receiverId = (req as any).user?.id;

    if (!receiverId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Please login to continue'
      });
    }

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount',
        message: 'Amount must be greater than 0'
      });
    }

    console.log('🎬 [PRESENTATION MODE] Receiving payment');
    console.log(`   Amount: AED ${amountNum}`);
    console.log(`   Merchant Phone: ${merchantPhone}`);

    // Get receiver info
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: 'Receiver not found',
        message: 'Your account was not found'
      });
    }

    // ✅ HARDCODED PAYER FOR PRESENTATION: +971545449786
    const payerPhone = '+971545449786';
    let payer = await prisma.user.findFirst({
      where: { phoneNumber: payerPhone }
    });

    // If payer doesn't exist, create it
    if (!payer) {
      console.log('👤 Creating presentation payer account...');
      payer = await prisma.user.create({
        data: {
          name: 'Demo Payer (Account B)',
          email: 'payer@palmpay.com',
          phoneNumber: payerPhone,
          password: await bcrypt.hash('demo123', 10),
          balance: 100000
        }
      });
      console.log(`✅ Created payer: ${payer.name} (${payer.phoneNumber})`);
    }

    // Ensure payer has enough money
    const payerBalance = parseFloat(payer.balance.toString());
    if (payerBalance < amountNum) {
      console.log('⚠️ Adding funds to payer for presentation...');
      await prisma.user.update({
        where: { id: payer.id },
        data: { balance: 100000 }
      });
    }

    // Process transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update payer balance (decrement)
      await tx.user.update({
        where: { id: payer.id },
        data: { balance: { decrement: amountNum } }
      });

      // Update receiver balance (increment)
      await tx.user.update({
        where: { id: receiverId },
        data: { balance: { increment: amountNum } }
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          amount: amountNum,
          senderId: payer.id,
          receiverId,
          status: 'COMPLETED',
          transactionType: 'BIOMETRIC_PAYMENT',
          category: 'palm_payment',
          description: `Presentation payment from ${payer.name} (${payer.phoneNumber})`,
          method: 'PALM'
        },
        include: {
          sender: { 
            select: { name: true, phoneNumber: true, email: true } 
          },
          receiver: { 
            select: { name: true, phoneNumber: true, email: true } 
          }
        }
      });

      return transaction;
    });

    // Get updated balances
    const updatedReceiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { balance: true }
    });

    console.log('✅ Presentation payment completed!');
    console.log(`📊 New receiver balance: AED ${updatedReceiver?.balance}`);

    res.json({
      success: true,
      data: {
        id: result.id,
        amount: amountNum,
        transaction: {
          id: result.id,
          senderId: payer.id,
          receiverId: receiverId,
          amount: amountNum,
          method: 'PALM',
          status: 'COMPLETED',
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          description: result.description,
          sender: result.sender,
          receiver: result.receiver
        },
        newBalance: updatedReceiver ? Number(updatedReceiver.balance) : 0,
        presentationMode: true,
        payerAccount: payer.phoneNumber,
        receiverAccount: receiver.phoneNumber
      },
      message: `🎬 Presentation payment of AED ${amountNum.toFixed(2)} received from ${payer.name}`
    });

  } catch (error) {
    console.error('❌ Presentation payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment failed',
      message: 'Could not complete the presentation payment.',
      details: error.message
    });
  }
};