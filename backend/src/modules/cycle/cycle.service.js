import * as DbService from '../../db/db.service.js';
import { TenDayCycleModel } from '../../db/models/cycle.model.js';
import { TenDayTaskModel } from '../../db/models/cycle-task.model.js';
import { NotFoundError } from '../../utils/errors/errors.js';
import { AppError } from '../../utils/errors/app-error.js';


export const getCycles = async () => {
  return await DbService.find({
    model: TenDayCycleModel,
    filter: { status: { $in: ['completed', 'incomplete'] } },
    sort: { completedAt: -1 },
  });
};

export const getCurrentCycle = async () => {
  const cycle = await DbService.findOne({
    model: TenDayCycleModel,
    filter: { status: 'active' },
  });

  // Auto-expire: if cycle's endDate has passed, return null
  if (cycle && new Date(cycle.endDate) < new Date()) {
    const tasks = await DbService.find({ model: TenDayTaskModel, filter: { cycle: cycle._id } });
    const allDone = tasks.length === 0 || tasks.every(t => t.completed);
    const newStatus = allDone ? 'completed' : 'incomplete';
    // Use a silent update (no side-effects beyond status change)
    await DbService.findOneAndUpdate({
      model: TenDayCycleModel,
      filter: { _id: cycle._id },
      data: { status: newStatus, completedAt: new Date() },
    });
    return null;
  }

  return cycle;
};

export const createCycle = async (data) => {
  // Prevent duplicate active cycles
  const existing = await DbService.findOne({
    model: TenDayCycleModel,
    filter: { status: 'active' },
  });
  if (existing) {
    throw new AppError('An active cycle already exists. End or complete it before creating a new one.', 409);
  }
  // Parse YYYY-MM-DD date strings as local midnight (not UTC)
  const [sy, sm, sd] = data.startDate.split('-').map(Number);
  const startDate = new Date(sy, sm - 1, sd);
  let endDate;
  if (data.endDate) {
    const [ey, em, ed] = data.endDate.split('-').map(Number);
    endDate = new Date(ey, em - 1, ed);
  } else {
    endDate = new Date(sy, sm - 1, sd);
    endDate.setDate(endDate.getDate() + 9);
  }
  const cycleData = { ...data, startDate, endDate, status: 'active' };
  const cycle = await DbService.create({
    model: TenDayCycleModel,
    data: [cycleData],
  });
  return cycle;
};

export const updateCycle = async (id, data) => {
  const updated = await DbService.findOneAndUpdate({
    model: TenDayCycleModel,
    filter: { _id: id },
    data,
  });
  if (!updated) throw new NotFoundError('Cycle not found');
  return updated;
};

export const completeCycle = async (id) => {
  // All tasks must be completed to mark cycle as completed
  const tasks = await DbService.find({ model: TenDayTaskModel, filter: { cycle: id } });
  const allDone = tasks.length > 0 && tasks.every(t => t.completed);
  if (!allDone) {
    throw new AppError('Cannot complete cycle: not all tasks are done', 400);
  }
  const updated = await DbService.findOneAndUpdate({
    model: TenDayCycleModel,
    filter: { _id: id },
    data: { status: 'completed', completedAt: new Date() },
  });
  if (!updated) throw new NotFoundError('Cycle not found');
  return updated;
};

export const endCycle = async (id) => {
  // End cycle regardless of task completion → always incomplete
  const updated = await DbService.findOneAndUpdate({
    model: TenDayCycleModel,
    filter: { _id: id },
    data: { status: 'incomplete', completedAt: new Date() },
  });
  if (!updated) throw new NotFoundError('Cycle not found');
  return updated;
};

export const deleteCycle = async (id) => {
  // Atomic cascade: delete tasks first, then cycle
  await DbService.deleteMany({ model: TenDayTaskModel, filter: { cycle: id } });
  const result = await DbService.deleteOne({ model: TenDayCycleModel, filter: { _id: id } });
  if (result.deletedCount === 0) throw new NotFoundError('Cycle not found');
};

export const getCycleTasks = async (cycleId) => {
  return await DbService.find({
    model: TenDayTaskModel,
    filter: { cycle: cycleId },
    sort: { createdAt: 1 },
  });
};

export const createTask = async (data) => {
  const task = await DbService.create({
    model: TenDayTaskModel,
    data: [data],
  });
  return task;
};

export const updateTask = async (id, data) => {
  const updated = await DbService.findOneAndUpdate({
    model: TenDayTaskModel,
    filter: { _id: id },
    data,
  });
  if (!updated) throw new NotFoundError('Task not found');
  return updated;
};

export const toggleTaskComplete = async (id) => {
  const task = await DbService.findById({ model: TenDayTaskModel, id });
  if (!task) throw new NotFoundError('Task not found');
  const updated = await DbService.findOneAndUpdate({
    model: TenDayTaskModel,
    filter: { _id: id },
    data: { completed: !task.completed },
  });
  return updated;
};

export const deleteTask = async (id) => {
  const result = await DbService.deleteOne({ model: TenDayTaskModel, filter: { _id: id } });
  if (result.deletedCount === 0) throw new NotFoundError('Task not found');
};

export const getCycleProgress = async (cycleId) => {
  const tasks = await DbService.find({
    model: TenDayTaskModel,
    filter: { cycle: cycleId },
  });
  if (tasks.length === 0) return { day: 1, totalDays: 10, percentage: 0 };
  const completed = tasks.filter((t) => t.completed).length;
  const percentage = Math.round((completed / tasks.length) * 100);

  const cycle = await DbService.findById({ model: TenDayCycleModel, id: cycleId });
  if (!cycle) return { day: 1, totalDays: 10, percentage };

  const start = new Date(cycle.startDate);
  const end = new Date(cycle.endDate);
  const totalDays = Math.max(Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1, 1);
  const today = new Date();
  const day = Math.min(Math.max(Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1, 1), totalDays);

  return { day, totalDays, percentage };
};
