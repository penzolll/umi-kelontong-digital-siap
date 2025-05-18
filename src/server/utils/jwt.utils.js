
const jwt = require('jsonwebtoken');
const { config } = require('dotenv');

config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Generate a JWT token for a user
 * @param {Object} user - The user object
 * @returns {String} - JWT token
 */
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Verify a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} - Decoded token payload
 */
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
