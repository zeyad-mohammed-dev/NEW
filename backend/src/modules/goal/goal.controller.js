import { asyncHandler } from '../../utils/errors/async-handler.js';
import { successResponse } from '../../utils/response/response.js';
import * as goalService from './goal.service.js';

export const getActiveGoal = asyncHandler(async (req, res, next) => {
  const goal = await goalService.getActiveGoal();
  return successResponse({ res, message: 'Active goal retrieved', data: { goal } });
});

export const getGoalsHistory = asyncHandler(async (req, res, next) => {
  const goals = await goalService.getGoalsHistory();
  return successResponse({ res, message: 'Goals history retrieved', data: { goals } });
});

export const createGoal = asyncHandler(async (req, res, next) => {
  const goal = await goalService.createGoal(req.body);
  return successResponse({ res, message: 'Goal created', data: { goal }, statusCode: 201 });
});

export const updateGoal = asyncHandler(async (req, res, next) => {
  const goal = await goalService.updateGoal(req.params.id, req.body);
  return successResponse({ res, message: 'Goal updated', data: { goal } });
});

export const completeGoal = asyncHandler(async (req, res, next) => {
  const goal = await goalService.completeGoal(req.params.id);
  return successResponse({ res, message: 'Goal completed', data: { goal } });
});

export const deleteGoal = asyncHandler(async (req, res, next) => {
  await goalService.deleteGoal(req.params.id);
  return successResponse({ res, message: 'Goal deleted' });
});