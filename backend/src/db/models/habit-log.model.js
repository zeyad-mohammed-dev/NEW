import mongoose from 'mongoose';

const habitLogSchema = new mongoose.Schema(
  {
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    date: {
      type: String,
      required: true,
 },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

habitLogSchema.index({ habit: 1, date: 1 }, { unique: true });

export const HabitLogModel =
  mongoose.models.HabitLog || mongoose.model('HabitLog', habitLogSchema);

HabitLogModel.syncIndexes();
