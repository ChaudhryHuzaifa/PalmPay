@echo off
setlocal enabledelayedexpansion
title PalmPay Full-Stack Automation
color 0b

echo ======================================================
echo           🌴 PALMPAY BIOMETRIC SYSTEM 🌴
echo        [ Multi-Environment Setup & Launch ]
echo ======================================================
echo.

:: 0. PRE-FLIGHT CHECKS
python --version >nul 2>&1
if %errorlevel% neq 0 (echo ❌ ERROR: Python not found. && pause && exit /b)
node -v >nul 2>&1
if %errorlevel% neq 0 (echo ❌ ERROR: Node.js not found. && pause && exit /b)

:: 1. BIOMETRIC AI SERVICE (Backend Python)
echo 🛠️  Phase 1: Setting up Biometric AI Service...
start "PalmPay - Biometric AI" cmd /k "cd palmpay_backend\biometric_service && (if not exist venv (echo 📦 Creating Backend venv... && python -m venv venv && venv\Scripts\activate.bat && echo 📥 Installing AI Dependencies... && pip install -r requirements_final.txt) else (echo ✅ Backend venv found. && venv\Scripts\activate.bat)) && echo 🧠 Starting FastAPI Service... && python main.py"

:: 2. TRANSACTION BACKEND (Node.js/Prisma)
echo 🛠️  Phase 2: Setting up Transaction Backend...
start "PalmPay - Backend Server" cmd /k "cd palmpay_backend && (if not exist node_modules (echo 📦 Installing Node Modules... && npm install) else (echo ✅ Backend Modules Found.)) && echo 🛠️  Generating Prisma Client... && npx prisma generate && echo 🚀 Launching API... && npm run dev"

:: 3. FRONTEND PYTHON ENVIRONMENT (New Requirement)
echo 🛠️  Phase 3: Setting up Frontend Python Environment...
start "PalmPay - Frontend Python Env" cmd /k "cd frontend && (if not exist venv (echo 📦 Creating Frontend venv... && python -m venv venv && venv\Scripts\activate.bat && echo 📥 Installing Frontend Python Requirements... && pip install -r requirements_final.txt) else (echo ✅ Frontend venv found. && venv\Scripts\activate.bat)) && echo ✅ Frontend Python environment ready. Feel free to close this window if it's only for dependencies, or leave it open if it runs a script."

:: 4. FRONTEND UI & ELECTRON (Node.js)
echo 🛠️  Phase 4: Setting up Desktop UI...
timeout /t 3 /nobreak >nul
start "PalmPay - Desktop UI" cmd /k "cd frontend && (if not exist node_modules (echo 📦 Installing UI Dependencies... && npm install) else (echo ✅ UI Modules Found.)) && echo 🖥️  Launching Electron App... && npm start"

:: 5. ELECTRON BRIDGE
start "PalmPay - Electron Bridge" cmd /k "cd frontend && timeout /t 7 && npx electron ."

echo.
echo ======================================================
echo ✅ AUTOMATION COMPLETE
echo 🚀 All services (2x Python, 2x Node) are initializing.
echo ======================================================
pause