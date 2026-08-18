import { asyncHandler } from '../../utils/errors/async-handler.js';
import { successResponse } from '../../utils/response/response.js';
import * as habitService from './habit.service.js';

export const getHabits = asyncHandler(async (req, res, next) => {
  const habits = await habitService.getHabits();
  return successResponse({ res, message: 'Habits retrieved', data: { habits } });
});

export const getTodayHabits = asyncHandler(async (req, res, next) => {
  const data = await habitService.getTodayHabits();
  return successResponse({ res, message: 'Today habits retrieved', data });
});

export const createHabit = asyncHandler(async (req, res, next) => {
  const habit = await habitService.createHabit(req.body);
  return successResponse({ res, message: 'Habit created', data: { habit }, statusCode: 201 });
});

export const updateHabit = asyncHandler(async (req, res, next) => {
  const habit = await habitService.updateHabit(req.params.id, req.body);
  return successResponse({ res, message: 'Habit updated', data: { habit } });
});

export const deleteHabit = asyncHandler(async (req, res, next) => {
  await habitService.deleteHabit(req.params.id);
  return successResponse({ res, message: 'Habit deleted' });
});

export const toggleComplete = asyncHandler(async (req, res, next) => {
  const log = await habitService.toggleHabitComplete(req.params.id);
  return successResponse({ res, message: 'Habit completion toggled', data: { log } });
});

export const getHistory = asyncHandler(async (req, res, next) => {
  const history = await habitService.getHabitHistory();
  return successResponse({ res, message: 'History retrieved', data: { history } });
});

export const getStars = asyncHandler(async (req, res, next) => {
  const data = await habitService.getStarsSummary();
  return successResponse({ res, message: 'Stars retrieved', data });
});

export const getDayDetail = asyncHandler(async (req, res, next) => {
  const date = req.params.date;
  const data = await habitService.getDayDetail(date);
  return successResponse({ res, message: 'Day detail retrieved', data });
});

export const reorderHabits = asyncHandler(async (req, res, next) => {
  const result = await habitService.reorderHabits(req.body.reorder);
  return successResponse({ res, message: 'Habits reordered', data: { habits: result } });
});