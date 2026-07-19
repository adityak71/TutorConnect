const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'SessionBooked',
        'SessionCancelled',
        'SessionCompleted',
        'PaymentReceived',
        'PaymentCompleted',
        'ReviewReceived',
        'ProgressUpdated',
        'General',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedEntity: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'entityModel',
    },
    entityModel: {
      type: String,
      enum: ['Session', 'Payment', 'Review', 'Progress'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
