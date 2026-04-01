import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    ideaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', required: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, required: true, trim: true },
    approved: { type: Boolean, required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
