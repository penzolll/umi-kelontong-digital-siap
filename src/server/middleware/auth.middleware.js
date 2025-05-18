
const { verifyToken } = require('../utils/jwt.utils');

/**
 * Middleware to protect routes that require authentication
 */
exports.protect = (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please log in.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Add user info to request object
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

/**
 * Middleware to restrict access to specific roles
 * @param  {...String} roles - Allowed roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};
