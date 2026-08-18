import * as DbService from '../../db/db.service.js';
import { StudyTaskModel } from '../../db/models/study-task.model.js';
import { PomodoroSessionModel } from '../../db/models/pomodoro-session.model.js';

export const getAllTasks = async (filter = {}) => {
  return await DbService.find({ model: StudyTaskModel, filter, sort: { createdAt: -1 } });
};

export const createTask = async (data) => {
  const doc = new StudyTaskModel(data);
  const saved = await doc.save();
  return saved.toObject();
};

export const updateTask = async (id, data) => {
  const updateData = { ...data };
  if (updateData.completed) updateData.completedAt = new Date();
  const result = await DbService.findOneAndUpdate({ model: StudyTaskModel, filter: { _id: id }, data: updateData });
  return result ? result.toObject() : null;
};

export const deleteTask = async (id) => {
  return await DbService.deleteOne({ model: StudyTaskModel, filter: { _id: id } });
};

export const logPomodoroSession = async (data) => {
  const sessionData = {
    task: data.taskId || undefined,
    taskName: data.taskName || '',
    type: data.type,
    durationMinutes: data.durationMinutes,
    completedAt: new Date(),
  };
  const doc = new PomodoroSessionModel(sessionData);
  const session = await doc.save();

  // Increment pomodoro count on the task if it was a focus session
  if (data.type === 'focus' && data.taskId) {
    await DbService.updateOne({
      model: StudyTaskModel,
      filter: { _id: data.taskId },
      update: { $inc: { pomodorosCompleted: 1 } },
    });
  }
  return session;
};

export const getStudyStats = async () => {
  const [totalTasks, completedTasks, totalSessions, totalFocusMinutes] =
    await Promise.all([
      StudyTaskModel.countDocuments(),
      StudyTaskModel.countDocuments({ completed: true }),
      PomodoroSessionModel.countDocuments({ type: 'focus' }),
      PomodoroSessionModel.aggregate([
        { $match: { type: 'focus' } },
        { $group: { _id: null, total: { $sum: '$durationMinutes' } } },
      ]),
    ]);

  return {
    totalTasks,
    completedTasks,
    totalFocusSessions: totalSessions,
    totalFocusMinutes: totalFocusMinutes[0]?.total || 0,
  };
};

export const getDailySessionCount = async (dateStr) => {
  // Parse YYYY-MM-DD as local midnight (not UTC)
  const [y, m, d] = dateStr.split('-').map(Number);
  const dayStart = new Date(y, m - 1, d, 0, 0, 0, 0);
  const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999);
  const count = await PomodoroSessionModel.countDocuments({
    type: 'focus',
    completedAt: { $gte: dayStart, $lte: dayEnd },
  });
  return { count };
};

export const getSessionHistory = async (query = {}) => {
  const days = parseInt(query.days) || 30;
  // Use local midnight for start date
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1, 0, 0, 0, 0);

  // Get server's local IANA timezone for $dateToString
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const history = await PomodoroSessionModel.aggregate([
    {
      $match: {
        type: 'focus',
        completedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$completedAt', timezone: tz },
        },
        sessions: { $sum: 1 },
        totalMinutes: { $sum: '$durationMinutes' },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  return history.map((h) => ({
    date: h._id,
    sessions: h.sessions,
    totalMinutes: h.totalMinutes,
  }));
};
