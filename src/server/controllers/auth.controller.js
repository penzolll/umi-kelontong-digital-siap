
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const db = require('../config/db');
const { generateToken } = require('../utils/jwt.utils');
const { validateEmail, sanitizeInput } = require('../utils/validation.utils');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Register a new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide name, email and password'
      });
    }
    
    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email'
      });
    }
    
    // Check if user already exists
    const existingUser = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const sanitizedName = sanitizeInput(name);
    const result = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [sanitizedName, email, hashedPassword, 'customer']
    );
    
    const newUser = result.rows[0];
    
    // Generate JWT token
    const token = generateToken(newUser);
    
    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }
    
    // Check if user exists
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    const user = result.rows[0];
    
    if (!user || !(await bcrypt.compare(password, user.password || ''))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Google OAuth login
 * @route POST /api/auth/google
 */
exports.googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a token'
      });
    }
    
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const { name, email, sub: googleId } = ticket.getPayload();
    
    // Check if user exists
    let result = await db.query(
      'SELECT * FROM users WHERE email = $1 OR google_id = $2',
      [email, googleId]
    );
    
    let user = result.rows[0];
    
    if (!user) {
      // Create new user
      result = await db.query(
        'INSERT INTO users (name, email, google_id, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name, email, googleId, 'customer']
      );
      
      user = result.rows[0];
    } else if (!user.google_id) {
      // Update existing user with Google ID
      await db.query(
        'UPDATE users SET google_id = $1 WHERE id = $2',
        [googleId, user.id]
      );
    }
    
    // Generate JWT token
    const jwtToken = generateToken(user);
    
    res.status(200).json({
      status: 'success',
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    next(error);
  }
};

/**
 * Get current user
 * @route GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [req.user.id]
    );
    
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      user
    });
  } catch (error) {
    next(error);
  }
};
