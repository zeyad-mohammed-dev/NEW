import joi from 'joi';
import { generalFields } from '../../common/validation/general-fields.validation.js';

export const createRuleSchema = {
  body: joi.object({
    title: generalFields.name.required(),
    content: generalFields.content.optional().allow(''),
  }),
  params: joi.object({}).optional(),
  query: joi.object({}).optional(),
};

export const updateRuleSchema = {
  params: joi.object({ id: generalFields.id.required() }),
  body: joi.object({
    title: generalFields.name.optional(),
    content: generalFields.content.optional().allow(''),
  }),
  query: joi.object({}).optional(),
};

export const idParamSchema = {
  params: joi.object({ id: generalFields.id.required() }),
  body: joi.object({}).optional(),
  query: joi.object({}).optional(),
};
