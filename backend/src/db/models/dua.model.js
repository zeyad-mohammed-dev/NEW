import mongoose from 'mongoose';

const duaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['dua', 'zikr'],
      required: true,
    },
  },
  { timestamps: true }
);

export const DuaModel =
  mongoose.models.Dua || mongoose.model('Dua', duaSchema);

DuaModel.syncIndexes();
