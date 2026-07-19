const express = require('express');
const {
  createReview,
  getTutorReviews,
} = require('./reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get reviews is public
router.get('/:tutorId', getTutorReviews);

// Add review requires authentication and Student role
router.post('/', protect, authorize('Student'), createReview);

module.exports = router;
