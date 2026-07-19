const Session = require('./Session');
const Availability = require('../availability/Availability');

/**
 * @swagger
 * /sessions/book:
 *   post:
 *     summary: Book a tutoring session
 *     tags: [Sessions]
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
 *               - startTime
 *               - endTime
 *             properties:
 *               tutorId:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session booked successfully
 */
exports.bookSession = async (req, res, next) => {
  try {
    const { tutorId, startTime, endTime, notes } = req.body;
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }
    if (start < new Date()) {
      return res.status(400).json({ success: false, message: 'Cannot book sessions in the past' });
    }

    // Check tutor's recurring availability for this day of week (using UTC to be timezone-agnostic)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[start.getUTCDay()];
    
    // Convert session times to HH:MM strings in UTC
    const startHour = String(start.getUTCHours()).padStart(2, '0');
    const startMin = String(start.getUTCMinutes()).padStart(2, '0');
    const endHour = String(end.getUTCHours()).padStart(2, '0');
    const endMin = String(end.getUTCMinutes()).padStart(2, '0');
    
    const sessionStartStr = `${startHour}:${startMin}`;
    const sessionEndStr = `${endHour}:${endMin}`;

    const isAvailable = await Availability.findOne({
      tutor: tutorId,
      dayOfWeek: dayOfWeek,
      startTime: { $lte: sessionStartStr },
      endTime: { $gte: sessionEndStr }
    });

    if (!isAvailable) {
      return res.status(400).json({ success: false, message: 'Tutor is not available at this time' });
    }

    // Prevent double booking
    const overlappingSession = await Session.findOne({
      tutor: tutorId,
      status: { $ne: 'Cancelled' },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (overlappingSession) {
      return res.status(400).json({ success: false, message: 'Tutor is already booked for this time slot' });
    }

    const session = await Session.create({
      tutor: tutorId,
      student: req.user._id,
      startTime: start,
      endTime: end,
      notes
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /sessions/{id}/reschedule:
 *   put:
 *     summary: Reschedule a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startTime
 *               - endTime
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Session rescheduled successfully
 */
exports.rescheduleSession = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.body;
    const start = new Date(startTime);
    const end = new Date(endTime);

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.student.toString() !== req.user._id.toString() && session.tutor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to reschedule this session' });
    }

    // Availability and overlap checks again
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[start.getDay()];
    const sessionStartStr = start.toTimeString().substring(0, 5);
    const sessionEndStr = end.toTimeString().substring(0, 5);

    const isAvailable = await Availability.findOne({
      tutor: session.tutor,
      dayOfWeek: dayOfWeek,
      startTime: { $lte: sessionStartStr },
      endTime: { $gte: sessionEndStr }
    });

    if (!isAvailable) {
      return res.status(400).json({ success: false, message: 'Tutor is not available at the new time' });
    }

    const overlappingSession = await Session.findOne({
      _id: { $ne: session._id },
      tutor: session.tutor,
      status: { $ne: 'Cancelled' },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (overlappingSession) {
      return res.status(400).json({ success: false, message: 'Tutor is already booked for the new time slot' });
    }

    session.startTime = start;
    session.endTime = end;
    session.status = 'Pending'; // Rescheduling resets status
    await session.save();

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /sessions/{id}:
 *   delete:
 *     summary: Cancel a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session cancelled successfully
 */
exports.cancelSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.student.toString() !== req.user._id.toString() && session.tutor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this session' });
    }

    session.status = 'Cancelled';
    await session.save();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /sessions/student/{id}:
 *   get:
 *     summary: Get all sessions for a student
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of student sessions
 */
exports.getStudentSessions = async (req, res, next) => {
  try {
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access these sessions' });
    }

    const sessions = await Session.find({ student: req.params.id }).populate('tutor', 'name email');
    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /sessions/tutor/{id}:
 *   get:
 *     summary: Get all sessions for a tutor
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tutor sessions
 */
exports.getTutorSessions = async (req, res, next) => {
  try {
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to access these sessions' });
    }

    const sessions = await Session.find({ tutor: req.params.id }).populate('student', 'name email');
    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    next(error);
  }
};
