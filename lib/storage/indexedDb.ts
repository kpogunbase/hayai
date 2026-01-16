import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { LocalDocument, LocalBookmark, LocalHighlight } from '@/types/document';
import type { LocalReadingSession, LocalReadingStats, LocalDailyStats } from '@/types/stats';

// Database schema
interface HayaiDB extends DBSchema {
  documents: {
    key: string;
    value: LocalDocument;
    indexes: {
      'by-created': string;
      'by-opened': string;
    };
  };
  bookmarks: {
    key: string;
    value: LocalBookmark;
    indexes: {
      'by-document': string;
    };
  };
  highlights: {
    key: string;
    value: LocalHighlight;
    indexes: {
      'by-document': string;
    };
  };
  sessions: {
    key: string;
    value: LocalReadingSession;
    indexes: {
      'by-document': string;
      'by-date': string;
    };
  };
  stats: {
    key: string;
    value: LocalReadingStats;
  };
  dailyStats: {
    key: string;
    value: LocalDailyStats;
    indexes: {
      'by-date': string;
    };
  };
}

const DB_NAME = 'hayai-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<HayaiDB>> | null = null;

// Initialize the database
function getDb(): Promise<IDBPDatabase<HayaiDB>> {
  if (!dbPromise) {
    dbPromise = openDB<HayaiDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Documents store
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('by-created', 'createdAt');
          docStore.createIndex('by-opened', 'lastOpenedAt');
        }

        // Bookmarks store
        if (!db.objectStoreNames.contains('bookmarks')) {
          const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
          bookmarkStore.createIndex('by-document', 'documentId');
        }

        // Highlights store
        if (!db.objectStoreNames.contains('highlights')) {
          const highlightStore = db.createObjectStore('highlights', { keyPath: 'id' });
          highlightStore.createIndex('by-document', 'documentId');
        }

        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('by-document', 'documentId');
          sessionStore.createIndex('by-date', 'startedAt');
        }

        // Stats store (single record)
        if (!db.objectStoreNames.contains('stats')) {
          db.createObjectStore('stats', { keyPath: 'id' });
        }

        // Daily stats store
        if (!db.objectStoreNames.contains('dailyStats')) {
          const dailyStore = db.createObjectStore('dailyStats', { keyPath: 'date' });
          dailyStore.createIndex('by-date', 'date');
        }
      },
    });
  }
  return dbPromise;
}

// Generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// ==================== DOCUMENTS ====================

export async function getAllDocuments(): Promise<LocalDocument[]> {
  const db = await getDb();
  const docs = await db.getAllFromIndex('documents', 'by-opened');
  return docs.reverse(); // Most recent first
}

export async function getDocument(id: string): Promise<LocalDocument | undefined> {
  const db = await getDb();
  return db.get('documents', id);
}

export async function saveDocument(doc: Omit<LocalDocument, 'id'>): Promise<LocalDocument> {
  const db = await getDb();
  const newDoc: LocalDocument = {
    ...doc,
    id: generateId(),
  };
  await db.put('documents', newDoc);
  return newDoc;
}

export async function updateDocument(
  id: string,
  updates: Partial<LocalDocument>
): Promise<void> {
  const db = await getDb();
  const doc = await db.get('documents', id);
  if (doc) {
    await db.put('documents', { ...doc, ...updates });
  }
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('documents', id);

  // Also delete related bookmarks and highlights
  const tx = db.transaction(['bookmarks', 'highlights'], 'readwrite');
  const bookmarks = await tx.objectStore('bookmarks').index('by-document').getAllKeys(id);
  const highlights = await tx.objectStore('highlights').index('by-document').getAllKeys(id);

  for (const key of bookmarks) {
    await tx.objectStore('bookmarks').delete(key);
  }
  for (const key of highlights) {
    await tx.objectStore('highlights').delete(key);
  }
  await tx.done;
}

// ==================== BOOKMARKS ====================

export async function getBookmarksForDocument(documentId: string): Promise<LocalBookmark[]> {
  const db = await getDb();
  return db.getAllFromIndex('bookmarks', 'by-document', documentId);
}

export async function saveBookmark(
  bookmark: Omit<LocalBookmark, 'id'>
): Promise<LocalBookmark> {
  const db = await getDb();
  const newBookmark: LocalBookmark = {
    ...bookmark,
    id: generateId(),
  };
  await db.put('bookmarks', newBookmark);
  return newBookmark;
}

export async function deleteBookmark(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('bookmarks', id);
}

// ==================== HIGHLIGHTS ====================

export async function getHighlightsForDocument(documentId: string): Promise<LocalHighlight[]> {
  const db = await getDb();
  return db.getAllFromIndex('highlights', 'by-document', documentId);
}

export async function saveHighlight(
  highlight: Omit<LocalHighlight, 'id'>
): Promise<LocalHighlight> {
  const db = await getDb();
  const newHighlight: LocalHighlight = {
    ...highlight,
    id: generateId(),
  };
  await db.put('highlights', newHighlight);
  return newHighlight;
}

export async function deleteHighlight(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('highlights', id);
}

// ==================== STATS ====================

const STATS_KEY = 'main';

export async function getStats(): Promise<LocalReadingStats | undefined> {
  const db = await getDb();
  return db.get('stats', STATS_KEY);
}

export async function updateStats(updates: Partial<LocalReadingStats>): Promise<void> {
  const db = await getDb();
  const existing = await db.get('stats', STATS_KEY);
  const stats: LocalReadingStats & { id: string } = {
    id: STATS_KEY,
    totalDocumentsRead: 0,
    totalWordsRead: 0,
    totalReadingTimeSeconds: 0,
    updatedAt: new Date().toISOString(),
    ...(existing || {}),
    ...updates,
  };
  await db.put('stats', stats);
}

export async function incrementStats(
  wordsRead: number,
  readingTimeSeconds: number,
  documentCompleted: boolean = false
): Promise<void> {
  const db = await getDb();
  const existing = await db.get('stats', STATS_KEY);
  const stats: LocalReadingStats & { id: string } = {
    id: STATS_KEY,
    totalDocumentsRead: (existing?.totalDocumentsRead || 0) + (documentCompleted ? 1 : 0),
    totalWordsRead: (existing?.totalWordsRead || 0) + wordsRead,
    totalReadingTimeSeconds: (existing?.totalReadingTimeSeconds || 0) + readingTimeSeconds,
    updatedAt: new Date().toISOString(),
  };
  await db.put('stats', stats);
}

// ==================== DAILY STATS ====================

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export async function getDailyStats(): Promise<LocalDailyStats[]> {
  const db = await getDb();
  return db.getAll('dailyStats');
}

export async function updateDailyStats(
  wordsRead: number,
  readingTimeSeconds: number,
  documentsOpened: number = 0
): Promise<void> {
  const db = await getDb();
  const today = getTodayKey();
  const existing = await db.get('dailyStats', today);

  const stats: LocalDailyStats = {
    date: today,
    wordsRead: (existing?.wordsRead || 0) + wordsRead,
    readingTimeSeconds: (existing?.readingTimeSeconds || 0) + readingTimeSeconds,
    documentsOpened: (existing?.documentsOpened || 0) + documentsOpened,
  };

  await db.put('dailyStats', stats);
}

// ==================== SESSIONS ====================

export async function saveSession(
  session: Omit<LocalReadingSession, 'id'>
): Promise<LocalReadingSession> {
  const db = await getDb();
  const newSession: LocalReadingSession = {
    ...session,
    id: generateId(),
  };
  await db.put('sessions', newSession);
  return newSession;
}

// ==================== MIGRATION ====================

export interface ExportData {
  documents: LocalDocument[];
  bookmarks: LocalBookmark[];
  highlights: LocalHighlight[];
  stats: LocalReadingStats | undefined;
  dailyStats: LocalDailyStats[];
}

export async function exportAllData(): Promise<ExportData> {
  const db = await getDb();
  return {
    documents: await db.getAll('documents'),
    bookmarks: await db.getAll('bookmarks'),
    highlights: await db.getAll('highlights'),
    stats: await db.get('stats', STATS_KEY),
    dailyStats: await db.getAll('dailyStats'),
  };
}

export async function clearAllData(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(
    ['documents', 'bookmarks', 'highlights', 'sessions', 'stats', 'dailyStats'],
    'readwrite'
  );
  await Promise.all([
    tx.objectStore('documents').clear(),
    tx.objectStore('bookmarks').clear(),
    tx.objectStore('highlights').clear(),
    tx.objectStore('sessions').clear(),
    tx.objectStore('stats').clear(),
    tx.objectStore('dailyStats').clear(),
    tx.done,
  ]);
}

// Check if we have any local data
export async function hasLocalData(): Promise<boolean> {
  const db = await getDb();
  const count = await db.count('documents');
  return count > 0;
}
