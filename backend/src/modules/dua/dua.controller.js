import { asyncHandler } from '../../utils/errors/async-handler.js';
import { successResponse } from '../../utils/response/response.js';
import * as duaService from './dua.service.js';

export const getDuas = asyncHandler(async (req, res, next) => {
  const { search, type } = req.query;
  const duas = await duaService.getDuas(search, type);
  return successResponse({ res, message: 'Duas retrieved', data: { duas } });
});

export const createDua = asyncHandler(async (req, res, next) => {
  const dua = await duaService.createDua(req.body);
  return successResponse({ res, message: 'Dua created', data: { dua }, statusCode: 201 });
});

export const updateDua = asyncHandler(async (req, res, next) => {
  const dua = await duaService.updateDua(req.params.id, req.body);
  return successResponse({ res, message: 'Dua updated', data: { dua } });
});

export const deleteDua = asyncHandler(async (req, res, next) => {
  await duaService.deleteDua(req.params.id);
  return successResponse({ res, message: 'Dua deleted' });
});
