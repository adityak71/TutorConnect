const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  uploadDocument,
  getUserById,
  setUserStatus,
} = require('./userController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile/picture', protect, upload.single('picture'), uploadProfilePicture);
router.post('/profile/documents', protect, authorize('Tutor'), upload.single('document'), uploadDocument);

// Admin-only user management
router.get('/:id', protect, authorize('Admin'), getUserById);
router.put('/:id/status', protect, authorize('Admin'), setUserStatus);

module.exports = router;
