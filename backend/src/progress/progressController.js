const Progress = require('./Progress');
const Session = require('../sessions/Session');
const User = require('../users/User');
const { createNotification } = require('../notifications/notificationController');

/**
 * @swagger
 * /progress:
 *   post:
 *     summary: Log or update student progress
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - subject
 *             properties:
 *               studentId:
 *                 type: string
 *               sessionId:
 *                 type: string
 *               subject:
 *                 type: string
 *               topicsCovered:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [In Progress, Completed]
 *               completionPercentage:
 *                 type: number
 *               notes:
 *                 type: string
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Progress updated successfully
 */
exports.updateProgress = async (req, res, next) => {
  try {
    const {
      studentId,
      sessionId,
      subject,
      topicsCovered,
      status,
      completionPercentage,
      notes,
      feedback,
    } = req.body;

    // Check if student exists and has 'Student' role
    const studentUser = await User.findById(studentId);
    if (!studentUser || studentUser.role !== 'Student') {
      return res.status(404).json({ success: false, message: 'Student user not found' });
    }

    // Verify sessionId exists and tutor is the logged-in user
    let verifiedSession = null;
    if (sessionId) {
      verifiedSession = await Session.findById(sessionId);
      if (!verifiedSession) {
        return res.status(404).json({ success: false, message: 'Session not found' });
      }
      if (verifiedSession.tutor.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to log progress for a session you do not tutor',
        });
      }
    }

    // Find existing progress by session or create a new one
    let progress;
    if (sessionId) {
      progress = await Progress.findOne({ session: sessionId });
    }

    if (progress) {
      // Update existing record
      if (subject) progress.subject = subject;
      if (topicsCovered !== undefined) progress.topicsCovered = topicsCovered;
      if (status) progress.status = status;
      if (completionPercentage !== undefined) progress.completionPercentage = completionPercentage;
      if (notes !== undefined) progress.notes = notes;
      if (feedback !== undefined) progress.feedback = feedback;
      await progress.save();
    } else {
      // Create new progress record
      progress = await Progress.create({
        student: studentId,
        tutor: req.user._id,
        session: sessionId || undefined,
        subject: subject || (verifiedSession ? 'General Session Study' : 'General'),
        topicsCovered: topicsCovered || [],
        status: status || 'In Progress',
        completionPercentage: completionPercentage || 0,
        notes,
        feedback,
      });
    }

    // If progress status is 'Completed' and we have a session, update session status to 'Completed'
    if (progress.status === 'Completed' && sessionId && verifiedSession) {
      verifiedSession.status = 'Completed';
      await verifiedSession.save();

      // Notify student session is completed
      await createNotification(
        studentId,
        req.user._id,
        'SessionCompleted',
        'Session Completed',
        `Your session on ${new Date(verifiedSession.startTime).toLocaleDateString()} has been marked as Completed.`,
        sessionId,
        'Session'
      );
    }

    // Notify student about progress update
    await createNotification(
      studentId,
      req.user._id,
      'ProgressUpdated',
      'Progress Updated',
      `Your learning progress for "${progress.subject}" was updated by ${req.user.name}.`,
      progress._id,
      'Progress'
    );

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /progress/{studentId}:
 *   get:
 *     summary: Retrieve learning progress logs for a student
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of progress logs returned successfully
 */
exports.getStudentProgress = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // Authorization checks
    // Student can only read their own progress logs.
    if (req.user.role === 'Student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view another student\'s progress' });
    }

    // Tutor can only read if they have a session with the student.
    if (req.user.role === 'Tutor') {
      const sessionCount = await Session.countDocuments({
        student: studentId,
        tutor: req.user._id,
      });
      if (sessionCount === 0) {
        return res.status(403).json({ success: false, message: 'Not authorized to view progress for this student' });
      }
    }

    const progressLogs = await Progress.find({ student: studentId })
      .sort({ updatedAt: -1 })
      .populate('tutor', 'name email')
      .populate('session');

    res.status(200).json({
      success: true,
      count: progressLogs.length,
      data: progressLogs,
    });
  } catch (error) {
    next(error);
  }
};
