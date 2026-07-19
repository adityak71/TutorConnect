const Payment = require('./Payment');
const Session = require('../sessions/Session');
const User = require('../users/User');
const { createNotification } = require('../notifications/notificationController');
const crypto = require('crypto');

/**
 * @swagger
 * /payments/create:
 *   post:
 *     summary: Create a mock payment for a session
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - amount
 *             properties:
 *               sessionId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Payment intent created successfully
 */
exports.createPayment = async (req, res, next) => {
  try {
    const { sessionId, amount } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Verify req.user is the student of the session
    if (session.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to make payment for this session' });
    }

    // Check if there is already a completed payment for this session
    const existingPayment = await Payment.findOne({ session: sessionId, status: 'Completed' });
    if (existingPayment) {
      return res.status(400).json({ success: false, message: 'Payment for this session has already been completed' });
    }

    // Generate unique mock transaction ID
    const transactionId = 'tx_' + crypto.randomBytes(12).toString('hex');

    // Create a pending payment
    const payment = await Payment.create({
      student: req.user._id,
      tutor: session.tutor,
      session: sessionId,
      amount,
      transactionId,
      status: 'Pending',
    });

    res.status(201).json({
      success: true,
      message: 'Payment intent created. Call webhook or simulate completion to finalize.',
      data: payment,
      mockClientSecret: `mock_secret_${transactionId}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Mock payment gateway webhook
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionId
 *             properties:
 *               transactionId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Completed, Failed]
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
exports.webhook = async (req, res, next) => {
  try {
    let transactionId = req.body.transactionId;
    let paymentStatus = req.body.status || 'Completed';

    // Support standard webhook envelope formats
    if (req.body.type === 'payment.succeeded' && req.body.data) {
      transactionId = req.body.data.transactionId;
      paymentStatus = 'Completed';
    } else if (req.body.type === 'payment.failed' && req.body.data) {
      transactionId = req.body.data.transactionId;
      paymentStatus = 'Failed';
    }

    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'Missing transactionId in webhook body' });
    }

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found for this transaction ID' });
    }

    // Update payment status
    payment.status = paymentStatus;
    payment.receiptUrl = `https://tutorconnect-receipts.mock.s3.amazonaws.com/${transactionId}.pdf`;
    await payment.save();

    // Fetch details to customize notifications
    const studentUser = await User.findById(payment.student);
    const tutorUser = await User.findById(payment.tutor);

    const formattedAmount = `$${payment.amount.toFixed(2)}`;

    if (paymentStatus === 'Completed') {
      // 1. Notify Student
      await createNotification(
        payment.student,
        payment.tutor,
        'PaymentCompleted',
        'Payment Successful',
        `Your payment of ${formattedAmount} for the session with ${tutorUser ? tutorUser.name : 'your tutor'} was processed successfully.`,
        payment._id,
        'Payment'
      );

      // 2. Notify Tutor
      await createNotification(
        payment.tutor,
        payment.student,
        'PaymentReceived',
        'Payment Received',
        `You received a payment of ${formattedAmount} from student ${studentUser ? studentUser.name : 'a student'}.`,
        payment._id,
        'Payment'
      );
    } else {
      // Notify Student of failure
      await createNotification(
        payment.student,
        payment.tutor,
        'General',
        'Payment Failed',
        `Your payment of ${formattedAmount} for the session with ${tutorUser ? tutorUser.name : 'your tutor'} failed. Please try again.`,
        payment._id,
        'Payment'
      );
    }

    res.status(200).json({
      success: true,
      message: `Webhook received and payment status updated to ${paymentStatus}`,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /payments/history:
 *   get:
 *     summary: Retrieve transaction history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments returned successfully
 */
exports.getPaymentHistory = async (req, res, next) => {
  try {
    let query = {};

    // Filter by role
    if (req.user.role === 'Student') {
      query.student = req.user._id;
    } else if (req.user.role === 'Tutor') {
      query.tutor = req.user._id;
    } else if (req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view payment history' });
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .populate('student', 'name email')
      .populate('tutor', 'name email')
      .populate('session');

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};
