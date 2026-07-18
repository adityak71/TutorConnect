const User = require('../users/User');
const TutorProfile = require('./TutorProfile');

// @desc    Get all tutors (with optional filtering by subject, search)
// @route   GET /tutors
// @access  Public
exports.getAllTutors = async (req, res) => {
  try {
    const { subject, minRate, maxRate, search, page = 1, limit = 10 } = req.query;

    const filter = { isVerified: true };
    if (subject) filter.subjects = { $in: [subject] };
    if (minRate || maxRate) {
      filter.hourlyRate = {};
      if (minRate) filter.hourlyRate.$gte = Number(minRate);
      if (maxRate) filter.hourlyRate.$lte = Number(maxRate);
    }

    let query = TutorProfile.find(filter).populate('user', 'name email profilePicture');

    const skip = (Number(page) - 1) * Number(limit);
    query = query.skip(skip).limit(Number(limit));

    let tutors = await query;

    // Optional name search (applied after populate since it targets User.name)
    if (search) {
      const regex = new RegExp(search, 'i');
      tutors = tutors.filter((t) => t.user && regex.test(t.user.name));
    }

    const total = await TutorProfile.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: tutors.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: tutors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tutors.', error: error.message });
  }
};

// @desc    Get single tutor's public profile by ID
// @route   GET /tutors/:id
// @access  Public
exports.getTutorById = async (req, res) => {
  try {
    const tutorProfile = await TutorProfile.findById(req.params.id).populate(
      'user',
      'name email profilePicture createdAt'
    );

    if (!tutorProfile) {
      return res.status(404).json({ success: false, message: 'Tutor not found.' });
    }

    res.status(200).json({ success: true, data: tutorProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tutor.', error: error.message });
  }
};
