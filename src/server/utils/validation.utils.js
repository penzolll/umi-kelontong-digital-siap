
/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
exports.validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

/**
 * Sanitize input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result and message
 */
exports.validatePassword = (password) => {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long'
    };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }
  
  return {
    isValid: true,
    message: ''
  };
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if phone number is valid
 */
exports.validatePhone = (phone) => {
  const phoneRegex = /^[0-9+\-\s]{8,15}$/;
  return phoneRegex.test(phone);
};
