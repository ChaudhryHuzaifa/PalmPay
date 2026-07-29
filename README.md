# PalmPay: Biometric Payment System

PalmPay is a secure, palm-based biometric fintech application. It utilizes a hybrid deep learning model to identify users and process transactions seamlessly.

## 🏗 Architecture
- **Biometric Service**: Python/Flask + TensorFlow. Handles palm detection and matching.
- **Quantum Backend**: Node.js/TypeScript + Prisma. Handles user data and transactions.
- **Frontend**: React + Electron + Vite. The desktop interface for merchants and users.

## 🚀 One-Click Setup
Run the **`run_palmpay.bat`** file in the root directory. This script will:
1. Create Python virtual environments for both Backend and Frontend.
2. Install all Node and Python dependencies.
3. Sync the database via Prisma.
4. Launch all 4 required service terminals.

## 🎯 Presentation & Demo Mode
The system includes a pre-configured "Presentation Setup" to demonstrate the Scan-to-Pay flow instantly.

**Demo Accounts:**
- **Receiver (Account A):** `+971568100583` (PIN: `123456`) | Balance: 5,000 AED
- **Payer (Account B):** `+971545449786` | Balance: 100,000 AED

**Testing the Flow:**
1. Run `run_palmpay.bat`.
2. Login to the Electron App as **Account A**.
3. Select **"Receive Payment"** and enter an amount.
4. Scan a palm (System is in demo-mode; any palm image will trigger the transfer).
5. Observe the real-time balance update from Account B to Account A.

## 🧪 Testing the System
1. **Model Verification**: Check the logs in the "PalmPay - Biometric AI" terminal to ensure the `.h5` model loaded successfully.
2. **Transaction Flow**: Use the 'Test Payment' feature in the Electron app to trigger a scan request.
3. **Database Integrity**: Verify entries in PostgreSQL via Prisma Studio.

---
*Created by Chaudhry Huzaifa*
