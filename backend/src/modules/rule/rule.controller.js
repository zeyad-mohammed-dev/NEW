import { asyncHandler } from '../../utils/errors/async-handler.js';
import { successResponse } from '../../utils/response/response.js';
import * as ruleService from './rule.service.js';

export const getRules = asyncHandler(async (req, res, next) => {
  const { search } = req.query;
  const rules = await ruleService.getRules(search);
  return successResponse({ res, message: 'Rules retrieved', data: { rules } });
});

export const getRuleById = asyncHandler(async (req, res, next) => {
  const rule = await ruleService.getRuleById(req.params.id);
  return successResponse({ res, message: 'Rule retrieved', data: { rule } });
});

export const createRule = asyncHandler(async (req, res, next) => {
  const rule = await ruleService.createRule(req.body);
  return successResponse({ res, message: 'Rule created', data: { rule }, statusCode: 201 });
});

export const updateRule = asyncHandler(async (req, res, next) => {
  const rule = await ruleService.updateRule(req.params.id, req.body);
  return successResponse({ res, message: 'Rule updated', data: { rule } });
});

export const deleteRule = asyncHandler(async (req, res, next) => {
  await ruleService.deleteRule(req.params.id);
  return successResponse({ res, message: 'Rule deleted' });
});
