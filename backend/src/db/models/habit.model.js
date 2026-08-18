import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    time: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'circle-check',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const HabitModel =
  mongoose.models.Habit || mongoose.model('Habit', habitSchema);

HabitModel.syncIndexes();