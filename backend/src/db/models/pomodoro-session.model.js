import mongoose from 'mongoose';

const pomodoroSessionSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyTask' },
    taskName: { type: String, trim: true },
    type: { type: String, enum: ['focus', 'break'], required: true },
    durationMinutes: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const PomodoroSessionModel =
  mongoose.models.PomodoroSession || mongoose.model('PomodoroSession', pomodoroSessionSchema);

PomodoroSessionModel.syncIndexes();
