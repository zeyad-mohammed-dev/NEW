import joi from 'joi';
import { generalFields } from '../../common/validation/general-fields.validation.js';

export const createHabitSchema = {
  body: joi.object({
    name: generalFields.name.required(),
    time: generalFields.time.optional().allow('').empty(''),
    icon: joi.string().optional(),
    order: joi.number().optional(),
  }),
  params: joi.object({}).optional(),
  query: joi.object({}).optional(),
};

export const updateHabitSchema = {
  params: joi.object({
    id: generalFields.id.required(),
  }),
  body: joi.object({
    name: generalFields.name.optional(),
    time: generalFields.time.optional().allow('').empty(''),
    icon: joi.string().optional(),
    order: joi.number().optional(),
  }),
  query: joi.object({}).optional(),
};

export const idParamSchema = {
  params: joi.object({
    id: generalFields.id.required(),
  }),
  body: joi.object({}).optional(),
  query: joi.object({}).optional(),
};
