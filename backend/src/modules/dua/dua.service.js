import * as DbService from '../../db/db.service.js';
import { DuaModel } from '../../db/models/dua.model.js';
import { NotFoundError } from '../../utils/errors/errors.js';

export const getDuas = async (search, type) => {
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }
  if (type && type !== 'all') {
    filter.type = type;
  }
  return await DbService.find({
    model: DuaModel,
    filter,
    sort: { createdAt: -1 },
  });
};

export const getLatestDua = async () => {
  const dua = await DbService.findOne({
    model: DuaModel,
    sort: { createdAt: -1 },
  });
  return dua;
};

export const createDua = async (data) => {
  const dua = await DbService.create({ model: DuaModel, data: [data] });
  return dua;
};

export const updateDua = async (id, data) => {
  const updated = await DbService.findOneAndUpdate({
    model: DuaModel,
    filter: { _id: id },
    data,
  });
  if (!updated) throw new NotFoundError('Dua not found');
  return updated;
};

export const deleteDua = async (id) => {
  const result = await DbService.deleteOne({ model: DuaModel, filter: { _id: id } });
  if (result.deletedCount === 0) throw new NotFoundError('Dua not found');
};
