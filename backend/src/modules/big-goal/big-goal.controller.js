import { asyncHandler } from '../../utils/errors/async-handler.js';
import { successResponse } from '../../utils/response/response.js';
import * as bigGoalService from './big-goal.service.js';

export const getBigGoals = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  const goals = await bigGoalService.getBigGoals(status);
  return successResponse({ res, message: 'Big Goals retrieved', data: { goals } });
});

export const createBigGoal = asyncHandler(async (req, res, next) => {
  const goal = await bigGoalService.createBigGoal(req.body);
  return successResponse({ res, message: 'Big Goal created', data: { goal }, statusCode: 201 });
});

export const updateBigGoal = asyncHandler(async (req, res, next) => {
  const goal = await bigGoalService.updateBigGoal(req.params.id, req.body);
  return successResponse({ res, message: 'Big Goal updated', data: { goal } });
});

export const deleteBigGoal = asyncHandler(async (req, res, next) => {
  await bigGoalService.deleteBigGoal(req.params.id);
  return successResponse({ res, message: 'Big Goal deleted' });
});
