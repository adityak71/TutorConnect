const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require('./authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;
