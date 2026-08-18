import mongoose from 'mongoose';

const tenDayCycleSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'incomplete'],
      default: 'active',
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const TenDayCycleModel =
  mongoose.models.TenDayCycle || mongoose.model('TenDayCycle', tenDayCycleSchema);

TenDayCycleModel.syncIndexes();
