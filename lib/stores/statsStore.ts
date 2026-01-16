import { create } from 'zustand';
import type {
  ReadingStats,
  DailyReadingStats,
  CurrentSessionStats,
  ComputedStats,
} from '@/types/stats';

interface StatsState {
  // Aggregated stats
  totalStats: ReadingStats | null;
  dailyStats: DailyReadingStats[];
  isLoading: boolean;

  // Current session
  currentSession: CurrentSessionStats | null;

  // Actions - Stats data
  setTotalStats: (stats: ReadingStats | null) => void;
  setDailyStats: (stats: DailyReadingStats[]) => void;
  setLoading: (isLoading: boolean) => void;

  // Actions - Session tracking
  startSession: (documentId: string, startIndex: number) => void;
  updateSessionWords: (currentIndex: number) => void;
  endSession: () => CurrentSessionStats | null;
  recordSession: (session: {
    documentId: string;
    wordsRead: number;
    durationSeconds: number;
    averageWpm: number;
    startIndex: number;
    endIndex: number;
  }) => void;

  // Computed
  getComputedStats: () => ComputedStats;
}

// Helper to get date string in YYYY-MM-DD format
const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Helper to check if date is within period
const isWithinPeriod = (
  dateStr: string,
  period: 'today' | 'week' | 'month' | 'year'
): boolean => {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today':
      return getDateString(date) === getDateString(today);
    case 'week': {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }
    case 'month': {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return date >= monthAgo;
    }
    case 'year': {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return date >= yearAgo;
    }
    default:
      return true;
  }
};

export const useStatsStore = create<StatsState>((set, get) => ({
  // Initial state
  totalStats: null,
  dailyStats: [],
  isLoading: false,
  currentSession: null,

  // Stats data actions
  setTotalStats: (totalStats) => set({ totalStats }),
  setDailyStats: (dailyStats) => set({ dailyStats }),
  setLoading: (isLoading) => set({ isLoading }),

  // Session tracking actions
  startSession: (documentId, startIndex) => {
    set({
      currentSession: {
        documentId,
        startedAt: new Date(),
        startIndex,
        wordsReadThisSession: 0,
        elapsedSeconds: 0,
      },
    });
  },

  updateSessionWords: (currentIndex) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const wordsRead = Math.max(0, currentIndex - currentSession.startIndex);
    const elapsedSeconds = Math.floor(
      (Date.now() - currentSession.startedAt.getTime()) / 1000
    );

    set({
      currentSession: {
        ...currentSession,
        wordsReadThisSession: wordsRead,
        elapsedSeconds,
      },
    });
  },

  endSession: () => {
    const { currentSession } = get();
    set({ currentSession: null });
    return currentSession;
  },

  recordSession: (session) => {
    // Update total stats with the session data
    const { totalStats, dailyStats } = get();
    const today = getDateString(new Date());

    // Update or create total stats
    const newTotalStats: ReadingStats = totalStats
      ? {
          ...totalStats,
          totalWordsRead: totalStats.totalWordsRead + session.wordsRead,
          totalReadingTimeSeconds:
            totalStats.totalReadingTimeSeconds + session.durationSeconds,
        }
      : {
          id: crypto.randomUUID(),
          userId: '',
          totalDocumentsRead: 1,
          totalWordsRead: session.wordsRead,
          totalReadingTimeSeconds: session.durationSeconds,
          updatedAt: new Date().toISOString(),
        };

    // Update or create daily stats for today
    const existingDailyIndex = dailyStats.findIndex((d) => d.date === today);
    let newDailyStats: DailyReadingStats[];

    if (existingDailyIndex >= 0) {
      newDailyStats = dailyStats.map((d, i) =>
        i === existingDailyIndex
          ? {
              ...d,
              wordsRead: d.wordsRead + session.wordsRead,
              readingTimeSeconds: d.readingTimeSeconds + session.durationSeconds,
            }
          : d
      );
    } else {
      newDailyStats = [
        ...dailyStats,
        {
          id: crypto.randomUUID(),
          userId: '',
          date: today,
          wordsRead: session.wordsRead,
          readingTimeSeconds: session.durationSeconds,
          documentsOpened: 1,
        },
      ];
    }

    set({
      totalStats: newTotalStats,
      dailyStats: newDailyStats,
    });
  },

  // Computed stats
  getComputedStats: (): ComputedStats => {
    const { totalStats, dailyStats } = get();

    // Default stats
    const defaultStats: ComputedStats = {
      totalDocumentsRead: 0,
      totalWordsRead: 0,
      totalReadingTimeSeconds: 0,
      wordsToday: 0,
      wordsThisWeek: 0,
      wordsThisMonth: 0,
      wordsThisYear: 0,
      averageWordsPerDay: 0,
      averageWordsPerWeek: 0,
      averageWordsPerMonth: 0,
      averageWpm: 0,
      currentStreak: 0,
      longestStreak: 0,
    };

    if (!totalStats) return defaultStats;

    // Calculate time-based word counts from daily stats
    let wordsToday = 0;
    let wordsThisWeek = 0;
    let wordsThisMonth = 0;
    let wordsThisYear = 0;

    for (const day of dailyStats) {
      if (isWithinPeriod(day.date, 'today')) {
        wordsToday += day.wordsRead;
      }
      if (isWithinPeriod(day.date, 'week')) {
        wordsThisWeek += day.wordsRead;
      }
      if (isWithinPeriod(day.date, 'month')) {
        wordsThisMonth += day.wordsRead;
      }
      if (isWithinPeriod(day.date, 'year')) {
        wordsThisYear += day.wordsRead;
      }
    }

    // Calculate averages
    const daysWithData = dailyStats.length || 1;
    const weeksWithData = Math.ceil(daysWithData / 7) || 1;
    const monthsWithData = Math.ceil(daysWithData / 30) || 1;

    const averageWordsPerDay = Math.round(totalStats.totalWordsRead / daysWithData);
    const averageWordsPerWeek = Math.round(totalStats.totalWordsRead / weeksWithData);
    const averageWordsPerMonth = Math.round(totalStats.totalWordsRead / monthsWithData);

    // Calculate average WPM
    const totalMinutes = totalStats.totalReadingTimeSeconds / 60;
    const averageWpm = totalMinutes > 0
      ? Math.round(totalStats.totalWordsRead / totalMinutes)
      : 0;

    return {
      totalDocumentsRead: totalStats.totalDocumentsRead,
      totalWordsRead: totalStats.totalWordsRead,
      totalReadingTimeSeconds: totalStats.totalReadingTimeSeconds,
      wordsToday,
      wordsThisWeek,
      wordsThisMonth,
      wordsThisYear,
      averageWordsPerDay,
      averageWordsPerWeek,
      averageWordsPerMonth,
      averageWpm,
      currentStreak: 0, // TODO: Implement streak calculation
      longestStreak: 0,
    };
  },
}));
