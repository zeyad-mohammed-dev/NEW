import mongoose from 'mongoose';

const studyTaskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 300 },
    subject: { type: String, trim: true, maxlength: 100, default: '' },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    pomodorosCompleted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const StudyTaskModel =
  mongoose.models.StudyTask || mongoose.model('StudyTask', studyTaskSchema);

StudyTaskModel.syncIndexes();
