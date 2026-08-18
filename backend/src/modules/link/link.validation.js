import joi from 'joi';
import { generalFields } from '../../common/validation/general-fields.validation.js';

export const createCategorySchema = {
  body: joi.object({
    name: joi.string().trim().max(50).required(),
    color: joi.string().trim().max(30).optional(),
  }),
  params: joi.object({}).optional(),
  query: joi.object({}).optional(),
};

export const updateCategorySchema = {
  params: joi.object({ id: generalFields.id.required() }),
  body: joi.object({
    name: joi.string().trim().max(50).optional(),
    color: joi.string().trim().max(30).optional(),
  }),
  query: joi.object({}).optional(),
};

export const createLinkSchema = {
  body: joi.object({
    title: generalFields.name.required(),
    url: generalFields.url.required(),
    description: generalFields.name.optional().allow(''),
    category: generalFields.name.optional().allow(''),
    categoryColor: joi.string().trim().max(30).optional(),
    type: joi.string().valid('youtube', 'linkedin', 'facebook', 'instagram', 'tiktok', 'documentation', 'else').optional().default('else'),
  }),
  params: joi.object({}).optional(),
  query: joi.object({}).optional(),
};

export const updateLinkSchema = {
  params: joi.object({ id: generalFields.id.required() }),
  body: joi.object({
    title: generalFields.name.optional(),
    url: generalFields.url.optional(),
    description: generalFields.name.optional().allow(''),
    category: generalFields.name.optional().allow(''),
    categoryColor: joi.string().trim().max(30).optional(),
    type: joi.string().valid('youtube', 'linkedin', 'facebook', 'instagram', 'tiktok', 'documentation', 'else').optional(),
  }),
  query: joi.object({}).optional(),
};

export const idParamSchema = {
  params: joi.object({ id: generalFields.id.required() }),
  body: joi.object({}).optional(),
  query: joi.object({}).optional(),
};
