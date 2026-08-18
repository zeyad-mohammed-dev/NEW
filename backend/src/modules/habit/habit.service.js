import * as DbService from '../../db/db.service.js';
import { HabitModel } from '../../db/models/habit.model.js';
import { HabitLogModel } from '../../db/models/habit-log.model.js';
import { NotFoundError, ConflictError } from '../../utils/errors/errors.js';

// Helper: get today's date as YYYY-MM-DD (local timezone)
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Helper: convert a Date object to YYYY-MM-DD string (local timezone)
const toDateStr = (d) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getHabits = async () => {
  const habits = await DbService.find({
    model: HabitModel,
    sort: { order: 1, createdAt: 1 },
  });
  return habits;
};

export const getTodayHabits = async () => {
  const today = todayStr();
  const habits = await DbService.find({
    model: HabitModel,
    sort: { order: 1, createdAt: 1 },
  });

  const logs = await HabitLogModel.find({ date: today });
  const logMap = {};
  logs.forEach((l) => {
    logMap[l.habit.toString()] = l.completed;
  });

  const habitsWithStatus = habits.map((h) => ({
    ...h.toObject(),
    completed: logMap[h._id.toString()] || false,
  }));

  return { date: today, habits: habitsWithStatus };
};

export const createHabit = async (data) => {
  const habit = await DbService.create({
    model: HabitModel,
    data: [data],
  });
  return habit;
};

export const updateHabit = async (id, data) => {
  const updated = await DbService.findOneAndUpdate({
    model: HabitModel,
    filter: { _id: id },
    data,
  });
  if (!updated) throw new NotFoundError('Habit not found');
  return updated;
};

export const deleteHabit = async (id) => {
  const result = await DbService.deleteOne({
    model: HabitModel,
    filter: { _id: id },
  });
  if (result.deletedCount === 0) throw new NotFoundError('Habit not found');
  // Also delete logs for this habit
  await DbService.deleteMany({
    model: HabitLogModel,
    filter: { habit: id },
  });
};

export const toggleHabitComplete = async (id) => {
  const today = todayStr();
  const habit = await DbService.findById({ model: HabitModel, id });
  if (!habit) throw new NotFoundError('Habit not found');

  const existing = await HabitLogModel.findOne({
    habit: id,
    date: today,
  });

  if (existing) {
    existing.completed = !existing.completed;
    await existing.save();
    return existing;
  } else {
    const log = await DbService.create({
      model: HabitLogModel,
      data: [{ habit: id, date: today, completed: true }],
    });
    return log;
  }
};

export const getHabitHistory = async () => {
  const days = 30;
  const today = new Date();
  const allHabits = await DbService.find({ model: HabitModel });
  const history = [];

  // Build newest-first (today at index 0)
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = toDateStr(d);

    const logs = await HabitLogModel.find({ date: dateStr });
    const completedCount = logs.filter((l) => l.completed).length;
    const totalHabits = allHabits.length;

    // Star rule: all habits must be completed for that day
    const earned = totalHabits > 0 && completedCount === totalHabits;

    history.push({
      date: dateStr,
      earned,
      completedCount,
      totalHabits,
    });
  }

  return history;
};

export const getStarsSummary = async () => {
  const today = new Date();
  const allHabits = await DbService.find({ model: HabitModel });
  const totalHabits = allHabits.length;

  // Total stars ever
  const allLogs = await HabitLogModel.find({ completed: true }).distinct('date');

  let totalStars = 0;
  for (const date of allLogs) {
    const logsForDate = await HabitLogModel.find({ date, completed: true });
    if (totalHabits > 0 && logsForDate.length === totalHabits) {
      totalStars++;
    }
  }

  // 7-day strip
  const weekStrip = [];
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - mondayOffset + i);
    const dateStr = toDateStr(d);

    const logsForDate = await HabitLogModel.find({ date: dateStr, completed: true });
    const earned = totalHabits > 0 && logsForDate.length === totalHabits;
    const isToday = dateStr === todayStr();

    weekStrip.push({ date: dateStr, earned, isToday });
  }

  return { totalStars, weekStrip };
};

export const isTodayComplete = async () => {
  const today = todayStr();
  const allHabits = await DbService.find({ model: HabitModel });
  if (allHabits.length === 0) return false;

  const logs = await HabitLogModel.find({ date: today, completed: true });
  return logs.length === allHabits.length;
};

export const getTodayProgress = async () => {
  const today = todayStr();
  const allHabits = await DbService.find({ model: HabitModel });
  if (allHabits.length === 0) return 0;

  const logs = await HabitLogModel.find({ date: today, completed: true });
  return Math.round((logs.length / allHabits.length) * 100);
};

export const getDayDetail = async (date) => {
  const habits = await DbService.find({ model: HabitModel, sort: { time: 1 } });
  const logs = await HabitLogModel.find({ date });
  const logMap = {};
  logs.forEach((l) => { logMap[l.habit.toString()] = l.completed; });

  const habitsWithStatus = habits.map((h) => ({
    ...h.toObject(),
    completed: logMap[h._id.toString()] || false,
  }));

  const completedCount = habitsWithStatus.filter((h) => h.completed).length;
  const earned = habits.length > 0 && completedCount === habits.length;

  return { date, habits: habitsWithStatus, earned };
};

export const reorderHabits = async (reorder) => {
  for (const item of reorder) {
    await HabitModel.findByIdAndUpdate(item.id, { order: item.order });
  }
  return await DbService.find({ model: HabitModel, sort: { order: 1, createdAt: 1 } });
};
