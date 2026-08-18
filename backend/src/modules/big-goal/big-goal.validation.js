import joi from 'joi';
import { generalFields } from '../../common/validation/general-fields.validation.js';

export const createBigGoalSchema = {
  body: joi.object({
    title: generalFields.name.required(),
    description: joi.string().trim().allow('').optional(),
    targetDate: joi.date().optional(),
  }),
  params: joi.object({}).optional(),
  query: joi.object({}).optional(),
};

export const updateBigGoalSchema = {
  params: joi.object({ id: generalFields.id.required() }),
  body: joi.object({
    title: generalFields.name.optional(),
    description: joi.string().trim().allow('').optional(),
    targetDate: joi.date().optional(),
    status: generalFields.goalStatus.optional(),
  }),
  query: joi.object({}).optional(),
};

export const idParamSchema = {
  params: joi.object({ id: generalFields.id.required() }),
  body: joi.object({}).optional(),
  query: joi.object({}).optional(),
};
