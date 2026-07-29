# save_as.ps1 - Run this entire script

# Clean up
Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Force vite.config.ts -ErrorAction SilentlyContinue
Remove-Item -Force tailwind.config.js -ErrorAction SilentlyContinue
Remove-Item -Force postcss.config.js -ErrorAction SilentlyContinue

# Function to save without BOM
function Save-UTF8NoBOM {
    param([string]$Path, [string]$Content)
    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.Encoding]::UTF8)
}

# Create minimal package.json
Write-Host "Creating package.json..." -ForegroundColor Green
$packageJson = '{
  "name": "palmpay-desktop",
  "version": "1.0.0",
  "description": "PalmPay Desktop Application",
  "main": "main.cjs",
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "electron": "electron ."
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.3.5"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.2.0",
    "vite": "^5.0.0",
    "electron": "^28.0.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}'
Save-UTF8NoBOM -Path "package.json" -Content $packageJson

# Install
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

# Create other configs
Write-Host "Creating config files..." -ForegroundColor Green

$viteConfig = 'import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    port: 3000,
  },
});'
Save-UTF8NoBOM -Path "vite.config.ts" -Content $viteConfig

$tailwindConfig = '/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}'
Save-UTF8NoBOM -Path "tailwind.config.js" -Content $tailwindConfig

$postcssConfig = 'module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}'
Save-UTF8NoBOM -Path "postcss.config.js" -Content $postcssConfig

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host "Run these commands in TWO separate PowerShell windows:" -ForegroundColor Cyan
Write-Host "Window 1: npm run start" -ForegroundColor Yellow
Write-Host "Window 2: npm run electron" -ForegroundColor Yellow