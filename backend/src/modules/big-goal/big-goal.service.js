import * as DbService from '../../db/db.service.js';
import { BigGoalModel } from '../../db/models/big-goal.model.js';
import { NotFoundError } from '../../utils/errors/errors.js';

export const getBigGoals = async (status) => {
  const filter = {};
  if (status && status !== 'all') filter.status = status;
  return await DbService.find({
    model: BigGoalModel,
    filter,
    sort: { createdAt: -1 },
  });
};

export const createBigGoal = async (data) => {
  const goal = await DbService.create({ model: BigGoalModel, data: [data] });
  return goal;
};

export const updateBigGoal = async (id, data) => {
  const updated = await DbService.findOneAndUpdate({
    model: BigGoalModel,
    filter: { _id: id },
    data,
  });
  if (!updated) throw new NotFoundError('Big Goal not found');
  return updated;
};

export const deleteBigGoal = async (id) => {
  const result = await DbService.deleteOne({ model: BigGoalModel, filter: { _id: id } });
  if (result.deletedCount === 0) throw new NotFoundError('Big Goal not found');
};
