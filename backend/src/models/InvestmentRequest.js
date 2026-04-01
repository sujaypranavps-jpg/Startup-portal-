import mongoose from 'mongoose';

const investmentRequestSchema = new mongoose.Schema(
  {
    ideaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', required: true },
    investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1000 },
    partnershipType: {
      type: String,
      enum: ['equity', 'debt', 'convertible'],
      required: true
    },
    note: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
  },
  { timestamps: true }
);

investmentRequestSchema.index({ ideaId: 1, investorId: 1 }, { unique: true });

export default mongoose.model('InvestmentRequest', investmentRequestSchema);
