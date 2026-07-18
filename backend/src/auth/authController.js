const crypto = require('crypto');
const User = require('../users/User');
const TutorProfile = require('../tutors/TutorProfile');
const StudentProfile = require('../users/StudentProfile');
const { sendTokenResponse } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user (Student or Tutor)
// @route   POST /auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, hourlyRate } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const allowedRoles = ['Student', 'Tutor'];
    const finalRole = allowedRoles.includes(role) ? role : 'Student';

    const user = await User.create({ name, email, password, role: finalRole });

    // Auto-create the matching profile document
    if (finalRole === 'Tutor') {
      await TutorProfile.create({
        user: user._id,
        hourlyRate: hourlyRate || 0,
      });
    } else {
      await StudentProfile.create({ user: user._id });
    }

    // Optional: email verification token
    const verifyToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Fire-and-forget verification email (won't break registration if SMTP isn't configured)
    try {
      const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify your TutorConnect account',
        html: `<p>Hi ${user.name}, please verify your email by clicking <a href="${verifyUrl}">this link</a>.</p>`,
      });
    } catch (emailErr) {
      console.warn('Verification email not sent:', emailErr.message);
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed.', error: error.message });
  }
};

// @desc    Login user
// @route   POST /auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed.', error: error.message });
  }
};

// @desc    Logout user - clears auth cookie
// @route   POST /auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// @desc    Verify email using token
// @route   GET /auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Email verification failed.', error: error.message });
  }
};

// @desc    Request password reset - sends reset link via email
// @route   POST /auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Respond the same way whether or not user exists (avoid leaking which emails are registered)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If that email is registered, a reset link has been sent.',
      });
    }

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'TutorConnect - Password Reset',
        html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to set a new password. This link expires in 1 hour.</p>`,
      });
    } catch (emailErr) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Could not send reset email.' });
    }

    res.status(200).json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Request failed.', error: error.message });
  }
};

// @desc    Reset password using token
// @route   PUT /auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link.' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Password reset failed.', error: error.message });
  }
};
