import jwt from 'jsonwebtoken';

// Hardcoded default for easy setup - change in production for security
const JWT_SECRET = process.env.JWT_SECRET || 'itss-nihongo-default-jwt-secret-2024-change-in-production-a8f5f167f44f4964e6c998dee827110c';

/**
 * Middleware to verify JWT token
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '認証が必要です'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'トークンが無効です'
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }

  next();
};
