import joi from 'joi';
import { generalFields } from '../../common/validation/general-fields.validation.js';

export const createGoalSchema = {
  body: joi.object({
    title: generalFields.name.required(),
    description: joi.string().trim().allow('').optional(),
  }),
  params: joi.object({}).optional(),
  query: joi.object({}).optional(),
};

export const updateGoalSchema = {
  params: joi.object({ id: generalFields.id.required() }),
  body: joi.object({
    title: generalFields.name.optional(),
    description: joi.string().trim().allow('').optional(),
  }),
  query: joi.object({}).optional(),
};

export const idParamSchema = {
  params: joi.object({ id: generalFields.id.required() }),
  body: joi.object({}).optional(),
  query: joi.object({}).optional(),
};
