import * as DbService from '../../db/db.service.js';
import { LinkModel } from '../../db/models/link.model.js';
import { LinkCategoryModel } from '../../db/models/link-category.model.js';
import { NotFoundError } from '../../utils/errors/errors.js';

export const getLinks = async (search, category, type) => {
  const filter = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { url: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) {
    filter.category = category;
  }
  if (type) {
    filter.type = type.toLowerCase();
  }
  return await DbService.find({
    model: LinkModel,
    filter,
    sort: { updatedAt: -1 },
  });
};

export const getLinkById = async (id) => {
  const link = await DbService.findById({ model: LinkModel, id });
  if (!link) throw new NotFoundError('Link not found');
  return link;
};

export const createLink = async (data) => {
  const doc = new LinkModel(data);
  const saved = await doc.save();
  return saved.toObject();
};

export const updateLink = async (id, data) => {
  const updated = await DbService.findOneAndUpdate({
    model: LinkModel,
    filter: { _id: id },
    data,
  });
  if (!updated) throw new NotFoundError('Link not found');
  return updated;
};

export const deleteLink = async (id) => {
  const result = await DbService.deleteOne({ model: LinkModel, filter: { _id: id } });
  if (result.deletedCount === 0) throw new NotFoundError('Link not found');
};

// === Category Service ===

export const getCategories = async () => {
  return await DbService.find({
    model: LinkCategoryModel,
    filter: {},
    sort: { name: 1 },
  });
};

export const createCategory = async (data) => {
  const doc = new LinkCategoryModel(data);
  const saved = await doc.save();
  return saved.toObject();
};

export const updateCategory = async (id, data) => {
  const existing = await DbService.findById({ model: LinkCategoryModel, id });
  if (!existing) throw new NotFoundError('Category not found');
  // If name is being changed, update all links with the old category name
  if (data.name && data.name !== existing.name) {
    await DbService.updateMany({
      model: LinkModel,
      filter: { category: existing.name },
      data: { $set: { category: data.name } },
    });
    // Also update color on links if provided
    if (data.color) {
      await DbService.updateMany({
        model: LinkModel,
        filter: { category: data.name },
        data: { $set: { categoryColor: data.color } },
      });
    }
  } else if (data.color) {
    // Only color changed, update links with this category name
    await DbService.updateMany({
      model: LinkModel,
      filter: { category: existing.name },
      data: { $set: { categoryColor: data.color } },
    });
  }
  const updated = await DbService.findOneAndUpdate({
    model: LinkCategoryModel,
    filter: { _id: id },
    data,
  });
  if (!updated) throw new NotFoundError('Category not found');
  return updated;
};

export const deleteCategory = async (id) => {
  const cat = await DbService.findById({ model: LinkCategoryModel, id });
  if (!cat) throw new NotFoundError('Category not found');
  // Remove category from all links that have it
  await DbService.updateMany({
    model: LinkModel,
    filter: { category: cat.name },
    data: { $set: { category: '', categoryColor: '' } },
  });
  const result = await DbService.deleteOne({ model: LinkCategoryModel, filter: { _id: id } });
  if (result.deletedCount === 0) throw new NotFoundError('Category not found');
};
