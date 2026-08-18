import joi from 'joi';
import { generalFields } from '../../common/validation/general-fields.validation.js';

export const createTaskSchema = {
  body: joi.object({
    name: joi.string().min(1).max(300).trim().required(),
    subject: joi.string().max(100).trim().allow('').default(''),
  }),
  params: joi.object({}).optional(),
  query: joi.object({}).optional(),
};

export const updateTaskSchema = {
  params: joi.object({ id: generalFields.id.required() }),
  body: joi.object({
    name: joi.string().min(1).max(300).trim().optional(),
    subject: joi.string().max(100).trim().allow('').optional(),
    completed: joi.boolean().optional(),
  }),
  query: joi.object({}).optional(),
};

export const idParamSchema = {
  params: joi.object({ id: generalFields.id.required() }),
  body: joi.object({}).optional(),
  query: joi.object({}).optional(),
};

export const logSessionSchema = {
  body: joi.object({
    taskId: generalFields.id.optional().allow(null),
    taskName: joi.string().trim().max(300).allow(''),
    type: joi.string().valid('focus', 'break').required(),
    durationMinutes: joi.number().min(1).max(120).required(),
  }),
  params: joi.object({}).optional(),
  query: joi.object({}).optional(),
};
