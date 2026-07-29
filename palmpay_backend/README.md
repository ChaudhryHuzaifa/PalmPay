# 🪪 PalmPay Backend System

A secure, production-ready backend for palm-biometric-based digital payment system.

## 🚀 Features

- ✅ Palm biometric authentication
- ✅ Adaptive confidence-based security
- ✅ Digital wallet management
- ✅ Transaction processing (PALM & PAYID methods)
- ✅ Complete audit logging
- ✅ RESTful API with TypeScript
- ✅ PostgreSQL with Prisma ORM
- ✅ Docker containerization
- ✅ Comprehensive security measures

## 📁 Project Structure
palmpay_backend/
├── src/
│ ├── config/ # Configuration files
│ ├── controllers/ # Request handlers
│ ├── middleware/ # Express middleware
│ ├── routes/ # API routes
│ ├── services/ # Business logic
│ ├── types/ # TypeScript definitions
│ ├── utils/ # Utility functions
│ ├── app.ts # Express app setup
│ └── index.ts # Application entry point
├── prisma/ # Database schema & migrations
├── biometric_service/ # FastAPI biometric service
├── tests/ # Test files
└── docker-compose.yml # Docker orchestration


## 🛠️ Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)
- Python 3.9+ (for biometric service)

### Local Development

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd palmpay_backend