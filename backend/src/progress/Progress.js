const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
    },
    subject: {
      type: String,
      required: true,
    },
    topicsCovered: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['In Progress', 'Completed'],
      default: 'In Progress',
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
    },
    feedback: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Progress', progressSchema);
