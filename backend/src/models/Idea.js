import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    industry: { type: String, required: true, trim: true },
    stage: {
      type: String,
      enum: ['concept', 'mvp', 'early-revenue', 'growth', 'scale'],
      default: 'concept'
    },
    teamSize: { type: Number, min: 1, default: 1 },
    fundingNeeded: { type: Number, min: 0, required: true },
    pitchDeck: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      originalName: { type: String, default: '' }
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rating: { type: Number, min: 1, max: 5, default: null },
    feedback: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Idea', ideaSchema);
