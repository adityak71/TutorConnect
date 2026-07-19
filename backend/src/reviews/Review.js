const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Unique index: a student can only leave one review per session (or one global review if session is null)
reviewSchema.index({ student: 1, tutor: 1, session: 1 }, { unique: true });

// Static method to calculate average rating and update TutorProfile
reviewSchema.statics.getAverageRating = async function (tutorId) {
  const obj = await this.aggregate([
    {
      $match: { tutor: tutorId },
    },
    {
      $group: {
        _id: '$tutor',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (obj.length > 0) {
      await mongoose.model('TutorProfile').findOneAndUpdate(
        { user: tutorId },
        {
          rating: Math.round(obj[0].averageRating * 10) / 10,
          totalReviews: obj[0].totalReviews,
        }
      );
    } else {
      await mongoose.model('TutorProfile').findOneAndUpdate(
        { user: tutorId },
        {
          rating: 0,
          totalReviews: 0,
        }
      );
    }
  } catch (err) {
    console.error('Error updating TutorProfile rating:', err.message);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.tutor);
});

// Call getAverageRating after delete
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.getAverageRating(doc.tutor);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
