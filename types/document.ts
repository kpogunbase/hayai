// Document types for the library system

export interface Document {
  id: string;
  userId: string;
  title: string;
  contentHash: string;
  wordCount: number;
  fileType: 'txt' | 'docx' | 'pdf' | 'epub' | 'paste';
  originalFilename: string | null;
  rawText: string;
  createdAt: string;
  lastOpenedAt: string;
  isArchived: boolean;
}

export interface LocalDocument extends Omit<Document, 'userId'> {
  // For anonymous users - stored in IndexedDB
  tokens: string[];
  bookmarks: LocalBookmark[];
  highlights: LocalHighlight[];
  lastPosition: number;
}

export interface Bookmark {
  id: string;
  userId: string;
  documentId: string;
  tokenIndex: number;
  label: string | null;
  contextSnippet: string;
  createdAt: string;
}

export interface LocalBookmark extends Omit<Bookmark, 'userId'> {
  // For anonymous users
}

export interface Highlight {
  id: string;
  userId: string;
  documentId: string;
  startIndex: number;
  endIndex: number;
  color: string;
  note: string | null;
  createdAt: string;
}

export interface LocalHighlight extends Omit<Highlight, 'userId'> {
  // For anonymous users
}

// Document creation input
export interface CreateDocumentInput {
  title: string;
  rawText: string;
  fileType: Document['fileType'];
  originalFilename?: string;
}

// For parsing results
export interface ParsedDocument {
  text: string;
  title: string;
  wordCount: number;
}

// Library filter options
export type LibraryFilter = 'all' | 'recent' | 'archived';

// Sort options
export type LibrarySortBy = 'lastOpenedAt' | 'createdAt' | 'title' | 'wordCount';
