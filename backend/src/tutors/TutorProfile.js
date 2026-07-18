const mongoose = require('mongoose');

const tutorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    subjects: {
      type: [String], // e.g. ["Math", "Physics", "English"]
      default: [],
    },
    qualifications: [
      {
        title: String, // e.g. "B.Sc. Mathematics"
        institution: String,
        year: Number,
      },
    ],
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    documents: [
      {
        name: String,
        url: String, // uploaded certificate/ID etc.
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    availability: [
      {
        day: {
          type: String,
          enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        startTime: String, // "09:00"
        endTime: String, // "17:00"
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false, // Admin verifies qualifications/documents
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TutorProfile', tutorProfileSchema);
