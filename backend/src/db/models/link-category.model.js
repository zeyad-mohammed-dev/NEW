import mongoose from 'mongoose';

const linkCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    color: {
      type: String,
      trim: true,
      default: '#8B5CF6',
    },
  },
  { timestamps: true }
);

// Ensure unique category names (case-insensitive)
linkCategorySchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export const LinkCategoryModel =
  mongoose.models.LinkCategory || mongoose.model('LinkCategory', linkCategorySchema);

LinkCategoryModel.syncIndexes();
