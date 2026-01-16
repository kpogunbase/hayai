import { create } from 'zustand';
import type { Document, LibraryFilter, LibrarySortBy } from '@/types/document';

interface LibraryState {
  // Data
  documents: Document[];
  isLoading: boolean;
  error: string | null;

  // UI State
  isOpen: boolean;

  // Filters
  filter: LibraryFilter;
  sortBy: LibrarySortBy;
  searchQuery: string;

  // Actions - UI
  setOpen: (isOpen: boolean) => void;

  // Actions - Data
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  loadDocuments: (userId?: string) => Promise<void>;

  // Actions - Loading
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions - Filters
  setFilter: (filter: LibraryFilter) => void;
  setSortBy: (sortBy: LibrarySortBy) => void;
  setSearchQuery: (query: string) => void;

  // Computed
  getFilteredDocuments: () => Document[];
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  // Initial state
  documents: [],
  isLoading: false,
  error: null,
  isOpen: false,
  filter: 'all',
  sortBy: 'lastOpenedAt',
  searchQuery: '',

  // UI actions
  setOpen: (isOpen) => set({ isOpen }),

  // Data actions
  setDocuments: (documents) => set({ documents }),

  // Load documents from storage
  loadDocuments: async (userId?: string) => {
    set({ isLoading: true, error: null });
    try {
      // Dynamically import to avoid circular dependencies
      const { getDocuments } = await import('@/lib/storage/documentStorage');
      const documents = await getDocuments(userId ?? null);
      set({ documents, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load documents',
        isLoading: false
      });
    }
  },

  addDocument: (document) => {
    set((state) => ({
      documents: [document, ...state.documents],
    }));
  },

  updateDocument: (id, updates) => {
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...updates } : doc
      ),
    }));
  },

  removeDocument: (id) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    }));
  },

  // Loading actions
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Filter actions
  setFilter: (filter) => set({ filter }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Computed - filtered and sorted documents
  getFilteredDocuments: () => {
    const { documents, filter, sortBy, searchQuery } = get();

    // Filter by archive status
    let filtered = documents.filter((doc) => {
      if (filter === 'archived') return doc.isArchived;
      if (filter === 'recent') return !doc.isArchived;
      return !doc.isArchived; // 'all' shows non-archived
    });

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          (doc.originalFilename?.toLowerCase().includes(query) ?? false)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'lastOpenedAt':
          return new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime();
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'wordCount':
          return b.wordCount - a.wordCount;
        default:
          return 0;
      }
    });

    return filtered;
  },
}));
