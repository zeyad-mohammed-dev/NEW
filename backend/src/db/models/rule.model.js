import mongoose from 'mongoose';

const ruleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

export const RuleModel =
  mongoose.models.Rule || mongoose.model('Rule', ruleSchema);

RuleModel.syncIndexes();
