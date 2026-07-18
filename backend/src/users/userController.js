const User = require('./User');
const TutorProfile = require('../tutors/TutorProfile');
const StudentProfile = require('./StudentProfile');

// @desc    Get logged-in user's full profile (User + Tutor/Student profile)
// @route   GET /users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    let roleProfile = null;

    if (user.role === 'Tutor') {
      roleProfile = await TutorProfile.findOne({ user: user._id });
    } else if (user.role === 'Student') {
      roleProfile = await StudentProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
        profile: roleProfile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile.', error: error.message });
  }
};

// @desc    Update logged-in user's profile (basic info + role-specific fields)
// @route   PUT /users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, ...roleFields } = req.body;

    if (name) {
      user.name = name;
      await user.save();
    }

    let roleProfile = null;

    if (user.role === 'Tutor') {
      const { bio, subjects, qualifications, experienceYears, hourlyRate, availability } = roleFields;
      roleProfile = await TutorProfile.findOneAndUpdate(
        { user: user._id },
        {
          ...(bio !== undefined && { bio }),
          ...(subjects !== undefined && { subjects }),
          ...(qualifications !== undefined && { qualifications }),
          ...(experienceYears !== undefined && { experienceYears }),
          ...(hourlyRate !== undefined && { hourlyRate }),
          ...(availability !== undefined && { availability }),
        },
        { new: true, runValidators: true, upsert: true }
      );
    } else if (user.role === 'Student') {
      const { gradeLevel, subjectsOfInterest, learningGoals, guardianContact } = roleFields;
      roleProfile = await StudentProfile.findOneAndUpdate(
        { user: user._id },
        {
          ...(gradeLevel !== undefined && { gradeLevel }),
          ...(subjectsOfInterest !== undefined && { subjectsOfInterest }),
          ...(learningGoals !== undefined && { learningGoals }),
          ...(guardianContact !== undefined && { guardianContact }),
        },
        { new: true, runValidators: true, upsert: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { name: user.name, role: user.role, profile: roleProfile },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update profile.', error: error.message });
  }
};

// @desc    Upload/update profile picture
// @route   POST /users/profile/picture
// @access  Private
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const filePath = `/uploads/${req.file.filename}`;
    req.user.profilePicture = filePath;
    await req.user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully.',
      profilePicture: filePath,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed.', error: error.message });
  }
};

// @desc    Upload a tutor document (certificate, ID, etc.)
// @route   POST /users/profile/documents
// @access  Private (Tutor only)
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const filePath = `/uploads/${req.file.filename}`;

    const tutorProfile = await TutorProfile.findOneAndUpdate(
      { user: req.user._id },
      { $push: { documents: { name: req.file.originalname, url: filePath } } },
      { new: true }
    );

    if (!tutorProfile) {
      return res.status(404).json({ success: false, message: 'Tutor profile not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully.',
      documents: tutorProfile.documents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Upload failed.', error: error.message });
  }
};

// @desc    Get any user by ID (Admin use, e.g. moderation)
// @route   GET /users/:id
// @access  Private (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user.', error: error.message });
  }
};

// @desc    Deactivate/reactivate a user (Admin)
// @route   PUT /users/:id/status
// @access  Private (Admin only)
exports.setUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({ success: true, message: `User ${isActive ? 'activated' : 'deactivated'}.`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user status.', error: error.message });
  }
};
