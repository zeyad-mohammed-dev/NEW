import { asyncHandler } from '../../utils/errors/async-handler.js';
import { successResponse } from '../../utils/response/response.js';
import * as dashboardService from './dashboard.service.js';

export const getSummary = asyncHandler(async (req, res, next) => {
  const data = await dashboardService.getDashboardSummary();
  return successResponse({ res, message: 'Dashboard summary retrieved', data });
});

export const getStats = asyncHandler(async (req, res, next) => {
  const data = await dashboardService.getDataStats();
  return successResponse({ res, message: 'Data stats retrieved', data });
});

export const exportData = asyncHandler(async (req, res, next) => {
  const data = await dashboardService.exportAllData();
  return successResponse({ res, message: 'Data exported', data });
});

export const importData = asyncHandler(async (req, res, next) => {
  await dashboardService.importAllData(req.body);
  return successResponse({ res, message: 'Data imported successfully' });
});

export const resetAll = asyncHandler(async (req, res, next) => {
  await dashboardService.resetAllData();
  return successResponse({ res, message: 'All data reset successfully' });
});
