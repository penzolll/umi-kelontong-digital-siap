
const express = require('express');
const { 
  register, 
  login, 
  googleLogin, 
  getMe 
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
