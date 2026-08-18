import * as DbService from '../../db/db.service.js';
import { GoalModel } from '../../db/models/goal.model.js';
import { NotFoundError, ConflictError } from '../../utils/errors/errors.js';

export const getActiveGoal = async () => {
  const goal = await DbService.findOne({
    model: GoalModel,
    filter: { status: 'active' },
  });
  return goal;
};

export const getGoalsHistory = async () => {
  const goals = await DbService.find({
    model: GoalModel,
    filter: { status: 'completed' },
    sort: { completedAt: -1 },
  });
  return goals;
};

export const createGoal = async (data) => {
  const active = await DbService.findOne({
    model: GoalModel,
    filter: { status: 'active' },
  });
  if (active) {
    throw new ConflictError('An active goal already exists. Complete or remove it first.');
  }
  const goal = await DbService.create({ model: GoalModel, data: [{ ...data, status: 'active' }] });
  return goal;
};

export const updateGoal = async (id, data) => {
  const updated = await DbService.findOneAndUpdate({
    model: GoalModel,
    filter: { _id: id },
    data,
  });
  if (!updated) throw new NotFoundError('Goal not found');
  return updated;
};

export const completeGoal = async (id) => {
  const updated = await DbService.findOneAndUpdate({
    model: GoalModel,
    filter: { _id: id },
    data: { status: 'completed', completedAt: new Date() },
  });
  if (!updated) throw new NotFoundError('Goal not found');
  return updated;
};

export const deleteGoal = async (id) => {
  const result = await DbService.deleteOne({ model: GoalModel, filter: { _id: id } });
  if (result.deletedCount === 0) throw new NotFoundError('Goal not found');
};
