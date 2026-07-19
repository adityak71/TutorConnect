const express = require('express');
const {
  updateProgress,
  getStudentProgress,
} = require('./progressController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All progress routes require authentication

router.post('/', authorize('Tutor', 'Admin'), updateProgress);
router.get('/:studentId', getStudentProgress);

module.exports = router;
