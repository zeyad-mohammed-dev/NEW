import mongoose from 'mongoose';

const bigGoalSchema = new mongoose.Schema(
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
    targetDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export const BigGoalModel =
  mongoose.models.BigGoal || mongoose.model('BigGoal', bigGoalSchema);

BigGoalModel.syncIndexes();
