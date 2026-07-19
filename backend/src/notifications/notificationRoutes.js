const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require('./notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All notification routes require authentication

router.route('/')
  .get(getNotifications);

router.route('/read-all')
  .put(markAllAsRead);

router.route('/:id/read')
  .put(markAsRead);

module.exports = router;
