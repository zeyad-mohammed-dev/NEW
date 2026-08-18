import joi from 'joi';
import { generalFields } from '../../common/validation/general-fields.validation.js';

export const createDuaSchema = {
  body: joi.object({
    name: generalFields.name.required(),
    content: generalFields.content.optional().allow(''),
    type: generalFields.duaType.optional().default('dua'),
  }),
  params: joi.object({}).optional(),
  query: joi.object({}).optional(),
};

export const updateDuaSchema = {
  params: joi.object({ id: generalFields.id.required() }),
  body: joi.object({
    name: generalFields.name.optional(),
    content: generalFields.content.optional().allow('').default(''),
    type: generalFields.duaType.optional(),
  }),
  query: joi.object({}).optional(),
};

export const idParamSchema = {
  params: joi.object({ id: generalFields.id.required() }),
  body: joi.object({}).optional(),
  query: joi.object({}).optional(),
};
