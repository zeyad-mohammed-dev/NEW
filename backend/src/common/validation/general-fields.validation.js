import joi from 'joi';
import { Types } from 'mongoose';

export const generalFields = {
  id: joi.string().custom((value, helpers) => {
    if (!Types.ObjectId.isValid(value)) return helpers.error('any.invalid');
    return value;
  }, 'MongoDB ID Validation'),

  name: joi.string().min(1).max(200).trim(),

  content: joi.string().min(1).trim(),

  time: joi.string().max(50).trim(),

  priority: joi.string().valid('low', 'medium', 'high'),

  duaType: joi.string().valid('dua', 'zikr'),

  goalStatus: joi.string().valid('active', 'completed'),

  url: joi.string().uri().max(2048).trim(),
};
