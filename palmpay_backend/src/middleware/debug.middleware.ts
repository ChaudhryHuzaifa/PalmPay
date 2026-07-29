import { Request, Response, NextFunction } from 'express';

export const debugMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  
  console.log(`➡️ [${requestId}] ${req.method} ${req.url} at ${new Date().toISOString()}`);
  
  // Log request body (excluding sensitive data)
  const logBody = { ...req.body };
  if (logBody.pin) logBody.pin = '***';
  if (logBody.password) logBody.password = '***';
  if (logBody.palmImage) logBody.palmImage = logBody.palmImage.substring(0, 20) + '...';
  
  console.log(`📦 [${requestId}] Body:`, JSON.stringify(logBody));
  
  // Capture original send
  const originalSend = res.send.bind(res);
  res.send = function(body) {
    const duration = Date.now() - start;
    console.log(`⬅️ [${requestId}] Response in ${duration}ms`);
    console.log(`📤 [${requestId}] Response status: ${res.statusCode}`);
    
    if (res.statusCode >= 400) {
      console.error(`❌ [${requestId}] Error response:`, typeof body === 'string' ? body : JSON.stringify(body));
    }
    
    return originalSend(body);
  };
  
  next();
};