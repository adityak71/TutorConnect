const express = require('express');
const {
  createPayment,
  webhook,
  getPaymentHistory,
} = require('./paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Webhook is public (simulated external service callback)
router.post('/webhook', webhook);

// All other endpoints require authentication
router.post('/create', protect, authorize('Student'), createPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
