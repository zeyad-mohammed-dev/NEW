import { asyncHandler } from '../../utils/errors/async-handler.js';
import { successResponse } from '../../utils/response/response.js';
import { NotFoundError } from '../../utils/errors/errors.js';
import * as studyService from './study.service.js';

export const getAllTasks = asyncHandler(async (req, res) => {
  const data = await studyService.getAllTasks();
  return successResponse({ res, data, message: 'Tasks retrieved' });
});

export const createTask = asyncHandler(async (req, res) => {
  const data = await studyService.createTask(req.body);
  return successResponse({ res, data, message: 'Task created', statusCode: 201 });
});

export const updateTask = asyncHandler(async (req, res) => {
  const data = await studyService.updateTask(req.params.id, req.body);
  if (!data) throw new NotFoundError('Task not found');
  return successResponse({ res, data, message: 'Task updated' });
});

export const deleteTask = asyncHandler(async (req, res) => {
  await studyService.deleteTask(req.params.id);
  return successResponse({ res, message: 'Task deleted' });
});

export const logSession = asyncHandler(async (req, res) => {
  const data = await studyService.logPomodoroSession(req.body);
  return successResponse({ res, data, message: 'Session logged', statusCode: 201 });
});

export const getStats = asyncHandler(async (req, res) => {
  const data = await studyService.getStudyStats();
  return successResponse({ res, data, message: 'Study stats retrieved' });
});

export const getDailySessionCount = asyncHandler(async (req, res) => {
  const date = req.query.date;
  const data = await studyService.getDailySessionCount(date);
  return successResponse({ res, data, message: 'Daily session count retrieved' });
});

export const getSessionHistory = asyncHandler(async (req, res) => {
  const data = await studyService.getSessionHistory(req.query);
  return successResponse({ res, data, message: 'Session history retrieved' });
});
