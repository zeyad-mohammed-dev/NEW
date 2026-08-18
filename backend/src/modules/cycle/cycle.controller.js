import { asyncHandler } from '../../utils/errors/async-handler.js';
import { successResponse } from '../../utils/response/response.js';
import * as cycleService from './cycle.service.js';

export const getCycles = asyncHandler(async (req, res, next) => {
  const cycles = await cycleService.getCycles();
  return successResponse({ res, message: 'Cycles retrieved', data: { cycles } });
});

export const getCurrentCycle = asyncHandler(async (req, res, next) => {
  const cycle = await cycleService.getCurrentCycle();
  return successResponse({ res, message: 'Current cycle retrieved', data: { cycle } });
});

export const createCycle = asyncHandler(async (req, res, next) => {
  const cycle = await cycleService.createCycle(req.body);
  return successResponse({ res, message: 'Cycle created', data: { cycle }, statusCode: 201 });
});

export const updateCycle = asyncHandler(async (req, res, next) => {
  const cycle = await cycleService.updateCycle(req.params.id, req.body);
  return successResponse({ res, message: 'Cycle updated', data: { cycle } });
});

export const completeCycle = asyncHandler(async (req, res, next) => {
  const cycle = await cycleService.completeCycle(req.params.id);
  return successResponse({ res, message: 'Cycle completed', data: { cycle } });
});

export const endCycle = asyncHandler(async (req, res, next) => {
  const cycle = await cycleService.endCycle(req.params.id);
  return successResponse({ res, message: 'Cycle ended', data: { cycle } });
});

export const deleteCycle = asyncHandler(async (req, res, next) => {
  await cycleService.deleteCycle(req.params.id);
  return successResponse({ res, message: 'Cycle deleted' });
});

export const getCycleTasks = asyncHandler(async (req, res, next) => {
  const tasks = await cycleService.getCycleTasks(req.params.cycleId);
  return successResponse({ res, message: 'Tasks retrieved', data: { tasks } });
});

export const createTask = asyncHandler(async (req, res, next) => {
  const task = await cycleService.createTask({ ...req.body, cycle: req.params.cycleId });
  return successResponse({ res, message: 'Task created', data: { task }, statusCode: 201 });
});

export const updateTask = asyncHandler(async (req, res, next) => {
  const task = await cycleService.updateTask(req.params.taskId, req.body);
  return successResponse({ res, message: 'Task updated', data: { task } });
});

export const toggleTaskComplete = asyncHandler(async (req, res, next) => {
  const task = await cycleService.toggleTaskComplete(req.params.taskId);
  return successResponse({ res, message: 'Task toggled', data: { task } });
});

export const deleteTask = asyncHandler(async (req, res, next) => {
  await cycleService.deleteTask(req.params.taskId);
  return successResponse({ res, message: 'Task deleted' });
});
