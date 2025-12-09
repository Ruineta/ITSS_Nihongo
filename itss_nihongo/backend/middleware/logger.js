/**
 * Request Logger Middleware
 * Logs all incoming requests with method, URL, and response time
 */

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log when response is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 400) {
      console.error(`❌ ${logMessage}`);
    } else {
      console.log(`✓ ${logMessage}`);
    }
  });
  
  next();
};
