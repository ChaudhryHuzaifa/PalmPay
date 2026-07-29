import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    open: false,
    
    // 🚨 DISABLE HMR IF IT'S CAUSING ISSUES
    hmr: false, // ⚠️ DISABLE HMR COMPLETELY
    
    // 🚨 NO HEADERS AT ALL
    headers: {},
    
    // Disable any built-in CSP
    cors: true,
    
    // Don't use HTTPS
    https: false,
  },
  
  // Build configuration
  build: {
    outDir: "dist",
    sourcemap: false, // Disable sourcemaps for faster build
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  
  // Define global constants
  define: {
    __DEV__: true,
    __PROD__: false,
    __DEMO__: true,
    'process.env.NODE_ENV': JSON.stringify('development')
  },
  
  // Optimize for development
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});