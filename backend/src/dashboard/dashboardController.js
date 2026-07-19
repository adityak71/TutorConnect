const Session = require('../sessions/Session');
const Payment = require('../payments/Payment');
const Progress = require('../progress/Progress');
const User = require('../users/User');
const TutorProfile = require('../tutors/TutorProfile');

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Retrieve dashboard statistics depending on the user's role
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;

    if (role === 'Student') {
      // 1. Fetch sessions
      const sessions = await Session.find({ student: req.user._id });

      let pending = 0;
      let confirmed = 0;
      let completed = 0;
      let cancelled = 0;

      sessions.forEach((s) => {
        if (s.status === 'Pending') pending++;
        else if (s.status === 'Confirmed') confirmed++;
        else if (s.status === 'Completed') completed++;
        else if (s.status === 'Cancelled') cancelled++;
      });

      // 2. Fetch spent money
      const payments = await Payment.find({ student: req.user._id, status: 'Completed' });
      const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

      // 3. Find unique tutors
      const uniqueTutorIds = [...new Set(sessions.map((s) => s.tutor.toString()))];
      const tutors = await User.find({ _id: { $in: uniqueTutorIds } }, 'name email profilePicture');

      // 4. Fetch progress metrics
      const progressLogs = await Progress.find({ student: req.user._id }).sort({ updatedAt: -1 });
      const avgProgressCompletion = progressLogs.length > 0
        ? progressLogs.reduce((sum, p) => sum + p.completionPercentage, 0) / progressLogs.length
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          sessions: {
            total: sessions.length,
            pending,
            confirmed,
            completed,
            cancelled,
          },
          totalSpent,
          tutorsCount: tutors.length,
          tutors,
          averageProgress: Math.round(avgProgressCompletion * 10) / 10,
          recentProgress: progressLogs.slice(0, 5),
        },
      });
    }

    if (role === 'Tutor') {
      // 1. Fetch sessions
      const sessions = await Session.find({ tutor: req.user._id });

      let pending = 0;
      let confirmed = 0;
      let completed = 0;
      let cancelled = 0;

      sessions.forEach((s) => {
        if (s.status === 'Pending') pending++;
        else if (s.status === 'Confirmed') confirmed++;
        else if (s.status === 'Completed') completed++;
        else if (s.status === 'Cancelled') cancelled++;
      });

      // 2. Fetch Tutor Profile details (rating, review count)
      const profile = await TutorProfile.findOne({ user: req.user._id });

      // 3. Fetch earnings
      const payments = await Payment.find({ tutor: req.user._id, status: 'Completed' });
      const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);

      // 4. Find unique students
      const uniqueStudentIds = [...new Set(sessions.map((s) => s.student.toString()))];
      const students = await User.find({ _id: { $in: uniqueStudentIds } }, 'name email profilePicture');

      // 5. Get upcoming sessions (confirmed, starting in the future)
      const upcomingSessions = await Session.find({
        tutor: req.user._id,
        status: 'Confirmed',
        startTime: { $gte: new Date() },
      })
        .sort({ startTime: 1 })
        .limit(5)
        .populate('student', 'name email profilePicture');

      return res.status(200).json({
        success: true,
        data: {
          sessions: {
            total: sessions.length,
            pending,
            confirmed,
            completed,
            cancelled,
          },
          totalEarnings,
          rating: profile ? profile.rating : 0,
          totalReviews: profile ? profile.totalReviews : 0,
          studentsCount: students.length,
          students,
          upcomingSessions,
        },
      });
    }

    if (role === 'Admin') {
      // 1. Platform-wide counts
      const studentsCount = await User.countDocuments({ role: 'Student' });
      const tutorsCount = await User.countDocuments({ role: 'Tutor' });
      const totalSessions = await Session.countDocuments();

      // 2. Total platform revenue
      const payments = await Payment.find({ status: 'Completed' });
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

      // 3. Average rating of all tutors
      const tutorProfiles = await TutorProfile.find();
      const avgTutorRating = tutorProfiles.length > 0
        ? tutorProfiles.reduce((sum, t) => sum + t.rating, 0) / tutorProfiles.length
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          users: {
            total: studentsCount + tutorsCount,
            students: studentsCount,
            tutors: tutorsCount,
          },
          sessions: {
            total: totalSessions,
          },
          totalRevenue,
          averageTutorRating: Math.round(avgTutorRating * 10) / 10,
        },
      });
    }

    res.status(403).json({ success: false, message: 'Invalid role for dashboard' });
  } catch (error) {
    next(error);
  }
};
