const Review = require('./Review');
const Session = require('../sessions/Session');
const User = require('../users/User');
const { createNotification } = require('../notifications/notificationController');

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Submit a review for a tutor
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tutorId
 *               - rating
 *               - comment
 *             properties:
 *               tutorId:
 *                 type: string
 *               sessionId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review submitted successfully
 */
exports.createReview = async (req, res, next) => {
  try {
    const { tutorId, sessionId, rating, comment } = req.body;

    // Validate rating range
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Check if target tutor exists and is actually a Tutor
    const tutorUser = await User.findById(tutorId);
    if (!tutorUser || tutorUser.role !== 'Tutor') {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    // Verify student has had at least one session with this tutor
    const sessionCount = await Session.countDocuments({
      student: req.user._id,
      tutor: tutorId,
    });

    if (sessionCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'You can only review a tutor with whom you have booked sessions.',
      });
    }

    // If sessionId is provided, verify it belongs to this student and tutor
    if (sessionId) {
      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }
      if (session.student.toString() !== req.user._id.toString() || session.tutor.toString() !== tutorId.toString()) {
        return res.status(400).json({ success: false, message: 'Invalid session reference for this tutor review' });
      }
    }

    // Check if review already exists for this tutor/session combination
    const query = {
      student: req.user._id,
      tutor: tutorId,
      session: sessionId || null,
    };
    const existingReview = await Review.findOne(query);
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this tutor/session combination.',
      });
    }

    // Create review (database post-save hook will update the average rating in TutorProfile)
    const review = await Review.create({
      student: req.user._id,
      tutor: tutorId,
      session: sessionId || undefined,
      rating,
      comment,
    });

    // Notify the tutor
    await createNotification(
      tutorId,
      req.user._id,
      'ReviewReceived',
      'New Review Received',
      `Student ${req.user.name} rated you ${rating} stars: "${comment}"`,
      review._id,
      'Review'
    );

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /reviews/{tutorId}:
 *   get:
 *     summary: Get all reviews for a tutor
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: tutorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews returned successfully
 */
exports.getTutorReviews = async (req, res, next) => {
  try {
    const { tutorId } = req.params;

    const reviews = await Review.find({ tutor: tutorId })
      .sort({ createdAt: -1 })
      .populate('student', 'name email profilePicture');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
