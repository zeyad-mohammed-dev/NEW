import mongoose from 'mongoose';

const tenDayTaskSchema = new mongoose.Schema(
  {
    cycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TenDayCycle',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const TenDayTaskModel =
  mongoose.models.TenDayTask || mongoose.model('TenDayTask', tenDayTaskSchema);

TenDayTaskModel.syncIndexes();
