import { AppError } from '../../utils/errors/app-error.js';
import * as habitService from '../habit/habit.service.js';
import * as DbService from '../../db/db.service.js';
import { GoalModel } from '../../db/models/goal.model.js';
import { TenDayCycleModel } from '../../db/models/cycle.model.js';
import { TenDayTaskModel } from '../../db/models/cycle-task.model.js';
import { DuaModel } from '../../db/models/dua.model.js';
import { RuleModel } from '../../db/models/rule.model.js';
import { HabitModel } from '../../db/models/habit.model.js';
import { HabitLogModel } from '../../db/models/habit-log.model.js';
import { BigGoalModel } from '../../db/models/big-goal.model.js';
import { StudyTaskModel } from '../../db/models/study-task.model.js';
import { PomodoroSessionModel } from '../../db/models/pomodoro-session.model.js';
import { LinkModel } from '../../db/models/link.model.js';
import { LinkCategoryModel } from '../../db/models/link-category.model.js';

export const getDataStats = async () => {
  const [habits, habitLogs, goals, cycles, cycleTasks, duas, rules, bigGoals, stars] =
    await Promise.all([
      HabitModel.countDocuments(),
      HabitLogModel.countDocuments(),
      GoalModel.countDocuments(),
      TenDayCycleModel.countDocuments(),
      TenDayTaskModel.countDocuments(),
      DuaModel.countDocuments(),
      RuleModel.countDocuments(),
      BigGoalModel.countDocuments(),
      habitService.getStarsSummary(),
    ]);

  const studyTasks = await StudyTaskModel.countDocuments();
  const pomodoroSessions = await PomodoroSessionModel.countDocuments();
  const links = await LinkModel.countDocuments();
  const linkCategories = await LinkCategoryModel.countDocuments();
  return { habits, habitLogs, goals, cycles, cycleTasks, duas, rules, bigGoals, studyTasks, pomodoroSessions, links, linkCategories, totalStars: stars.totalStars };
};

export const exportAllData = async () => {
  const [habits, habitLogs, goals, cycles, cycleTasks, duas, rules, bigGoals, studyTasks, pomodoroSessions, links, linkCategories] =
    await Promise.all([
      HabitModel.find().lean(),
      HabitLogModel.find().lean(),
      GoalModel.find().lean(),
      TenDayCycleModel.find().lean(),
      TenDayTaskModel.find().lean(),
      DuaModel.find().lean(),
      RuleModel.find().lean(),
      BigGoalModel.find().lean(),
      StudyTaskModel.find().lean(),
      PomodoroSessionModel.find().lean(),
      LinkModel.find().lean(),
      LinkCategoryModel.find().lean(),
    ]);

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    collections: { habits, habitLogs, goals, cycles, cycleTasks, duas, rules, bigGoals, studyTasks, pomodoroSessions, links, linkCategories },
  };
};

export const importAllData = async (data) => {
  if (!data?.collections) throw new AppError('Invalid backup file format', 400);

  const c = data.collections;

  // Clear existing data then insert imported
  await Promise.all([
    HabitModel.deleteMany({}),
    HabitLogModel.deleteMany({}),
    GoalModel.deleteMany({}),
    TenDayCycleModel.deleteMany({}),
    TenDayTaskModel.deleteMany({}),
    DuaModel.deleteMany({}),
    RuleModel.deleteMany({}),
    BigGoalModel.deleteMany({}),
    StudyTaskModel.deleteMany({}),
    PomodoroSessionModel.deleteMany({}),
    LinkModel.deleteMany({}),
    LinkCategoryModel.deleteMany({}),
  ]);

  const insertIfNotEmpty = (Model, docs) => {
    if (Array.isArray(docs) && docs.length > 0) return Model.insertMany(docs, { ordered: false });
    return Promise.resolve();
  };

  await Promise.all([
    insertIfNotEmpty(HabitModel, c.habits),
    insertIfNotEmpty(HabitLogModel, c.habitLogs),
    insertIfNotEmpty(GoalModel, c.goals),
    insertIfNotEmpty(TenDayCycleModel, c.cycles),
    insertIfNotEmpty(TenDayTaskModel, c.cycleTasks),
    insertIfNotEmpty(DuaModel, c.duas),
    insertIfNotEmpty(RuleModel, c.rules),
    insertIfNotEmpty(BigGoalModel, c.bigGoals),
    insertIfNotEmpty(StudyTaskModel, c.studyTasks),
    insertIfNotEmpty(PomodoroSessionModel, c.pomodoroSessions),
    insertIfNotEmpty(LinkModel, c.links),
    insertIfNotEmpty(LinkCategoryModel, c.linkCategories),
  ]);
};

export const resetAllData = async () => {
  await Promise.all([
    HabitModel.deleteMany({}),
    HabitLogModel.deleteMany({}),
    GoalModel.deleteMany({}),
    TenDayCycleModel.deleteMany({}),
    TenDayTaskModel.deleteMany({}),
    DuaModel.deleteMany({}),
    RuleModel.deleteMany({}),
    BigGoalModel.deleteMany({}),
    StudyTaskModel.deleteMany({}),
    PomodoroSessionModel.deleteMany({}),
    LinkModel.deleteMany({}),
    LinkCategoryModel.deleteMany({}),
  ]);
};

export const getDashboardSummary = async () => {
  const [activeGoal, todayData, stars, currentCycle, latestDua, todayProgress, todayComplete] =
    await Promise.all([
      DbService.findOne({ model: GoalModel, filter: { status: 'active' } }),
      habitService.getTodayHabits(),
      habitService.getStarsSummary(),
      DbService.findOne({
        model: TenDayCycleModel,
        filter: { status: 'active', startDate: { $lte: new Date() }, endDate: { $gte: new Date() } },
      }),
      DuaModel.findOne().sort({ createdAt: -1 }),
      habitService.getTodayProgress(),
      habitService.isTodayComplete(),
    ]);

  // Cycle progress
  let cycleProgress = null;
  if (currentCycle) {
    const tasks = await DbService.find({ model: TenDayTaskModel, filter: { cycle: currentCycle._id } });
    const completed = tasks.filter((t) => t.completed).length;
    const percentage = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

    const start = new Date(currentCycle.startDate);
    const end = new Date(currentCycle.endDate);
    const totalDays = Math.max(Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1, 1);
    const today = new Date();
    const day = Math.min(Math.max(Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1, 1), totalDays);

    cycleProgress = {
      day,
      totalDays,
      percentage,
      focus: tasks.length > 0 ? tasks.find((t) => !t.completed)?.name || tasks[0].name : '',
    };
  }

  return {
    activeGoal,
    todayHabits: todayData.habits,
    todayDate: todayData.date,
    stars: stars.totalStars,
    weekStrip: stars.weekStrip,
    cycleProgress,
    duaOfTheDay: latestDua,
    todayProgress,
    todayComplete,
  };
};
