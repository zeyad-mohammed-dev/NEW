import { asyncHandler } from '../../utils/errors/async-handler.js';
import { successResponse } from '../../utils/response/response.js';
import * as linkService from './link.service.js';

export const getLinks = asyncHandler(async (req, res, next) => {
  const { search, category, type } = req.query;
  const links = await linkService.getLinks(search, category, type);
  return successResponse({ res, message: 'Links retrieved', data: { links } });
});

export const getLinkById = asyncHandler(async (req, res, next) => {
  const link = await linkService.getLinkById(req.params.id);
  return successResponse({ res, message: 'Link retrieved', data: { link } });
});

export const createLink = asyncHandler(async (req, res, next) => {
  const link = await linkService.createLink(req.body);
  return successResponse({ res, message: 'Link created', data: { link }, statusCode: 201 });
});

export const updateLink = asyncHandler(async (req, res, next) => {
  const link = await linkService.updateLink(req.params.id, req.body);
  return successResponse({ res, message: 'Link updated', data: { link } });
});

export const deleteLink = asyncHandler(async (req, res, next) => {
  await linkService.deleteLink(req.params.id);
  return successResponse({ res, message: 'Link deleted' });
});

// === Category Endpoints ===

export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await linkService.getCategories();
  return successResponse({ res, message: 'Categories retrieved', data: { categories } });
});

export const createCategory = asyncHandler(async (req, res, next) => {
  const category = await linkService.createCategory(req.body);
  return successResponse({ res, message: 'Category created', data: { category }, statusCode: 201 });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await linkService.updateCategory(req.params.id, req.body);
  return successResponse({ res, message: 'Category updated', data: { category } });
});

export const deleteCategory = asyncHandler(async (req, res, next) => {
  await linkService.deleteCategory(req.params.id);
  return successResponse({ res, message: 'Category deleted' });
});
