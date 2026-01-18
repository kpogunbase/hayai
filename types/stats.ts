// Stats types for reading analytics

export interface ReadingSession {
  id: string;
  userId: string;
  documentId: string;
  startedAt: string;
  endedAt: string | null;
  wordsRead: number;
  startIndex: number;
  endIndex: number;
  averageWpm: number | null;
  mode: 'reading' | 'challenge';
}

export interface LocalReadingSession extends Omit<ReadingSession, 'userId'> {
  // For anonymous users
}

export interface ReadingStats {
  id: string;
  userId: string;
  totalDocumentsRead: number;
  totalWordsRead: number;
  totalReadingTimeSeconds: number;
  totalPassagesCompleted: number;
  updatedAt: string;
}

export interface LocalReadingStats {
  // For anonymous users
  totalDocumentsRead: number;
  totalWordsRead: number;
  totalReadingTimeSeconds: number;
  totalPassagesCompleted: number;
  updatedAt: string;
}

export interface DailyReadingStats {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  wordsRead: number;
  readingTimeSeconds: number;
  documentsOpened: number;
}

export interface LocalDailyStats extends Omit<DailyReadingStats, 'userId' | 'id'> {
  // For anonymous users
}

// Computed stats for display
export interface ComputedStats {
  // Counts
  totalDocumentsRead: number;
  totalWordsRead: number;
  totalReadingTimeSeconds: number;
  totalPassagesCompleted: number;

  // Time-based word counts
  wordsToday: number;
  wordsThisWeek: number;
  wordsThisMonth: number;
  wordsThisYear: number;

  // Averages
  averageWordsPerDay: number;
  averageWordsPerWeek: number;
  averageWordsPerMonth: number;
  averageWpm: number;

  // Streaks (optional future feature)
  currentStreak: number;
  longestStreak: number;
}

// For current reading session tracking
export interface CurrentSessionStats {
  documentId: string;
  startedAt: Date;
  startIndex: number;
  wordsReadThisSession: number;
  elapsedSeconds: number;
}

// Time period for filtering stats
export type StatsPeriod = 'today' | 'week' | 'month' | 'year' | 'allTime';
