const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    gradeLevel: {
      type: String, // e.g. "High School", "Grade 10", "Undergraduate"
      default: '',
    },
    subjectsOfInterest: {
      type: [String],
      default: [],
    },
    learningGoals: {
      type: String,
      maxlength: 500,
      default: '',
    },
    guardianContact: {
      name: String,
      phone: String,
      email: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
