import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const GoalModel =
  mongoose.models.Goal || mongoose.model('Goal', goalSchema);

GoalModel.syncIndexes();
