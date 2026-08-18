// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiRes<T = any> { success: boolean; message: string; data: T }

// ---------- Habits ----------
export interface Habit {
  _id: string;
  name: string;
  time: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}
export interface HabitWithStatus extends Habit {
  completed: boolean;
}
export interface HabitLog {
  _id: string;
  habit: string;
  date: string;
  completed: boolean;
}
export interface StarsData {
  totalStars: number;
  weekStrip: { date: string; earned: boolean; isToday: boolean }[];
}
export interface HistoryDay {
  date: string;
  earned: boolean;
  completedCount: number;
  totalHabits: number;
}

// ---------- OOG Goal ----------
export interface Goal {
  _id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------- 10-Day Cycle ----------
export interface TenDayCycle {
  _id: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'incomplete';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
export interface TenDayTask {
  _id: string;
  cycle: string;
  name: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------- Dua ----------
export interface Dua {
  _id: string;
  name: string;
  content: string;
  type: 'dua' | 'zikr';
  createdAt: string;
  updatedAt: string;
}

// ---------- Rule ----------
export interface Rule {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// ---------- Big Goal ----------
export interface BigGoal {
  _id: string;
  title: string;
  description?: string;
  targetDate?: string;
  status: 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

// ---------- Dashboard ----------
export interface DashboardSummary {
  activeGoal: Goal | null;
  todayHabits: HabitWithStatus[];
  todayDate: string;
  stars: number;
  weekStrip: { date: string; earned: boolean; isToday: boolean }[];
  cycleProgress: {
    day: number;
    totalDays: number;
    percentage: number;
    focus: string;
  } | null;
  duaOfTheDay: Dua | null;
  todayProgress: number;
  todayComplete: boolean;
}

// ---------- Study ----------
export interface StudyTask {
  _id: string;
  name: string;
  subject: string;
  completed: boolean;
  completedAt?: string;
  pomodorosCompleted: number;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSession {
  _id: string;
  task?: string;
  taskName: string;
  type: 'focus' | 'break';
  durationMinutes: number;
  completedAt: string;
}

// ---------- Link ----------
export interface Link {
  _id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  categoryColor: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}
