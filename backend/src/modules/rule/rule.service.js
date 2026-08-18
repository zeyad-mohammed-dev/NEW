import * as DbService from '../../db/db.service.js';
import { RuleModel } from '../../db/models/rule.model.js';
import { NotFoundError } from '../../utils/errors/errors.js';

export const getRules = async (search) => {
  const filter = {};
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }
  return await DbService.find({
    model: RuleModel,
    filter,
    sort: { updatedAt: -1 },
  });
};

export const getRuleById = async (id) => {
  const rule = await DbService.findById({ model: RuleModel, id });
  if (!rule) throw new NotFoundError('Rule not found');
  return rule;
};

export const createRule = async (data) => {
  const rule = await DbService.create({ model: RuleModel, data: [data] });
  return rule;
};

export const updateRule = async (id, data) => {
  const updated = await DbService.findOneAndUpdate({
    model: RuleModel,
    filter: { _id: id },
    data,
  });
  if (!updated) throw new NotFoundError('Rule not found');
  return updated;
};

export const deleteRule = async (id) => {
  const result = await DbService.deleteOne({ model: RuleModel, filter: { _id: id } });
  if (result.deletedCount === 0) throw new NotFoundError('Rule not found');
};