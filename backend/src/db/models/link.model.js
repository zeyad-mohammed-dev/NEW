import mongoose from 'mongoose';

const linkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: '',
    },
    categoryColor: {
      type: String,
      trim: true,
      default: '#8B5CF6',
    },
    type: {
      type: String,
      trim: true,
      default: 'else',
    },
  },
  { timestamps: true }
);

export const LinkModel =
  mongoose.models.Link || mongoose.model('Link', linkSchema);

LinkModel.syncIndexes();
