import { create } from 'zustand';
import type { Bookmark, Highlight, Document } from '@/types/document';

export type ReaderMode = 'reading' | 'challenge';
export type ChallengeDuration = '2min' | '3min' | '5min';

interface ReaderState {
  // Document state
  documentId: string | null;
  documentTitle: string | null;
  tokens: string[];
  rawText: string;

  // Playback state
  index: number;
  isPlaying: boolean;
  wpm: number;
  mode: ReaderMode;
  challengeDuration: ChallengeDuration;
  challengeStartTime: number | null;
  currentChallengeWpm: number;

  // UI state
  isSidePanelOpen: boolean;
  isLibraryOpen: boolean;

  // Highlighting state
  isHighlighting: boolean;
  highlightStartIndex: number | null;

  // Bookmarks & Highlights (cached for current document)
  bookmarks: Bookmark[];
  highlights: Highlight[];

  // Actions - Document
  loadDocument: (doc: {
    id: string;
    title: string;
    tokens: string[];
    rawText: string;
    bookmarks?: Bookmark[];
    highlights?: Highlight[];
  }) => void;
  setDocument: (id: string, tokens: string[], rawText: string) => void;
  clearDocument: () => void;

  // Actions - Playback
  setIndex: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlay: () => void;
  setWpm: (wpm: number) => void;
  setMode: (mode: ReaderMode) => void;
  setChallengeDuration: (duration: ChallengeDuration) => void;
  setChallengeStartTime: (time: number | null) => void;
  setCurrentChallengeWpm: (wpm: number) => void;

  // Actions - Navigation
  goBack: (steps?: number) => void;
  goForward: (steps?: number) => void;
  restart: () => void;
  jumpToIndex: (index: number) => void;

  // Actions - UI
  toggleSidePanel: () => void;
  setSidePanelOpen: (open: boolean) => void;
  toggleLibrary: () => void;
  setLibraryOpen: (open: boolean) => void;
  closeAllPanels: () => void;

  // Actions - Highlighting
  startHighlight: () => void;
  endHighlight: () => { startIndex: number; endIndex: number } | null;
  cancelHighlight: () => void;

  // Actions - Bookmarks & Highlights (local state)
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (bookmarkId: string) => void;
  addHighlight: (highlight: Highlight) => void;
  removeHighlight: (highlightId: string) => void;
  setBookmarks: (bookmarks: Bookmark[]) => void;
  setHighlights: (highlights: Highlight[]) => void;
}

const DEFAULT_WPM = 400;

export const useReaderStore = create<ReaderState>((set, get) => ({
  // Initial state
  documentId: null,
  documentTitle: null,
  tokens: [],
  rawText: '',
  index: 0,
  isPlaying: false,
  wpm: DEFAULT_WPM,
  mode: 'reading',
  challengeDuration: '3min',
  challengeStartTime: null,
  currentChallengeWpm: 300,
  isSidePanelOpen: false,
  isLibraryOpen: false,
  isHighlighting: false,
  highlightStartIndex: null,
  bookmarks: [],
  highlights: [],

  // Document actions
  loadDocument: ({ id, title, tokens, rawText, bookmarks = [], highlights = [] }) => {
    set({
      documentId: id,
      documentTitle: title,
      tokens,
      rawText,
      bookmarks,
      highlights,
      index: 0,
      isPlaying: false,
      isHighlighting: false,
      highlightStartIndex: null,
    });
  },

  setDocument: (id, tokens, rawText) => {
    set({
      documentId: id,
      tokens,
      rawText,
      index: 0,
      isPlaying: false,
      isHighlighting: false,
      highlightStartIndex: null,
    });
  },

  clearDocument: () => {
    set({
      documentId: null,
      documentTitle: null,
      tokens: [],
      rawText: '',
      bookmarks: [],
      highlights: [],
      index: 0,
      isPlaying: false,
      isHighlighting: false,
      highlightStartIndex: null,
    });
  },

  // Playback actions
  setIndex: (index) => set({ index }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setWpm: (wpm) => set({ wpm }),
  setMode: (mode) => set({ mode }),
  setChallengeDuration: (challengeDuration) => set({ challengeDuration }),
  setChallengeStartTime: (challengeStartTime) => set({ challengeStartTime }),
  setCurrentChallengeWpm: (currentChallengeWpm) => set({ currentChallengeWpm }),

  // Navigation actions
  goBack: (steps = 10) => {
    set((state) => ({
      index: Math.max(0, state.index - steps),
    }));
  },

  goForward: (steps = 10) => {
    set((state) => ({
      index: Math.min(state.tokens.length - 1, state.index + steps),
    }));
  },

  restart: () => {
    set({
      index: 0,
      isPlaying: false,
      challengeStartTime: null,
      currentChallengeWpm: 300,
    });
  },

  jumpToIndex: (index) => {
    const { tokens } = get();
    set({
      index: Math.max(0, Math.min(tokens.length - 1, index)),
    });
  },

  // UI actions
  toggleSidePanel: () => set((state) => ({ isSidePanelOpen: !state.isSidePanelOpen })),
  setSidePanelOpen: (open) => set({ isSidePanelOpen: open }),
  toggleLibrary: () => set((state) => ({ isLibraryOpen: !state.isLibraryOpen })),
  setLibraryOpen: (open) => set({ isLibraryOpen: open }),
  closeAllPanels: () => set({ isSidePanelOpen: false, isLibraryOpen: false }),

  // Highlighting actions
  startHighlight: () => {
    const { index, isHighlighting } = get();
    if (!isHighlighting) {
      set({
        isHighlighting: true,
        highlightStartIndex: index,
      });
    }
  },

  endHighlight: () => {
    const { isHighlighting, highlightStartIndex, index } = get();
    if (isHighlighting && highlightStartIndex !== null) {
      const startIndex = Math.min(highlightStartIndex, index);
      const endIndex = Math.max(highlightStartIndex, index);
      set({
        isHighlighting: false,
        highlightStartIndex: null,
      });
      return { startIndex, endIndex };
    }
    return null;
  },

  cancelHighlight: () => {
    set({
      isHighlighting: false,
      highlightStartIndex: null,
    });
  },

  // Bookmark & Highlight state actions
  addBookmark: (bookmark) => {
    set((state) => ({
      bookmarks: [...state.bookmarks, bookmark],
    }));
  },

  removeBookmark: (bookmarkId) => {
    set((state) => ({
      bookmarks: state.bookmarks.filter((b) => b.id !== bookmarkId),
    }));
  },

  addHighlight: (highlight) => {
    set((state) => ({
      highlights: [...state.highlights, highlight],
    }));
  },

  removeHighlight: (highlightId) => {
    set((state) => ({
      highlights: state.highlights.filter((h) => h.id !== highlightId),
    }));
  },

  setBookmarks: (bookmarks) => set({ bookmarks }),
  setHighlights: (highlights) => set({ highlights }),
}));
