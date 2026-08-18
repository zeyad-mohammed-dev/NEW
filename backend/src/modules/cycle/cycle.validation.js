import joi from 'joi';
import { generalFields } from '../../common/validation/general-fields.validation.js';

export const createCycleSchema = {
  body: joi.object({
    startDate: joi.date().required(),
    endDate: joi.date().greater(joi.ref('startDate')).optional(),
  }),
  params: joi.object({}).optional(),
  query: joi.object({}).optional(),
};

export const updateCycleSchema = {
  params: joi.object({ id: generalFields.id.required() }),
  body: joi.object({
    startDate: joi.date().optional(),
    endDate: joi.date().optional(),
    status: joi.string().valid('completed', 'incomplete').optional(),
  }),
  query: joi.object({}).optional(),
};

export const createTaskSchema = {
  params: joi.object({ cycleId: generalFields.id.required() }),
  body: joi.object({
    name: generalFields.name.required(),
    priority: generalFields.priority.required(),
  }),
  query: joi.object({}).optional(),
};

export const updateTaskSchema = {
  params: joi.object({ cycleId: generalFields.id.required(), taskId: generalFields.id.required() }),
  body: joi.object({
    name: generalFields.name.optional(),
    priority: generalFields.priority.optional(),
  }),
  query: joi.object({}).optional(),
};

export const cycleIdParamSchema = {
  params: joi.object({ id: generalFields.id.required() }),
  body: joi.object({}).optional(),
  query: joi.object({}).optional(),
};

export const taskIdParamSchema = {
  params: joi.object({ cycleId: generalFields.id.required(), taskId: generalFields.id.required() }),
  body: joi.object({}).optional(),
  query: joi.object({}).optional(),
};
