import { createClient } from '@/lib/supabase/client';
import * as localDb from './indexedDb';
import type {
  Document,
  LocalDocument,
  Bookmark,
  LocalBookmark,
  Highlight,
  LocalHighlight,
  CreateDocumentInput,
} from '@/types/document';
import { tokenize } from '@/lib/tokenize';

// Generate content hash for deduplication
async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ==================== DOCUMENTS ====================

export async function getDocuments(userId: string | null): Promise<Document[]> {
  if (userId) {
    // Authenticated user - fetch from Supabase
    const supabase = createClient();
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('last_opened_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    return (data || []).map(mapSupabaseDocument);
  } else {
    // Anonymous user - fetch from IndexedDB
    const docs = await localDb.getAllDocuments();
    return docs.filter((d) => !d.isArchived).map(mapLocalDocument);
  }
}

export async function getDocument(
  documentId: string,
  userId: string | null
): Promise<{ document: Document; bookmarks: Bookmark[]; highlights: Highlight[] } | null> {
  if (userId) {
    const supabase = createClient();

    // Fetch document
    const { data: doc, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (error || !doc) {
      return null;
    }

    // Fetch bookmarks and highlights in parallel
    const [bookmarksRes, highlightsRes] = await Promise.all([
      supabase
        .from('bookmarks')
        .select('*')
        .eq('document_id', documentId)
        .eq('user_id', userId),
      supabase
        .from('highlights')
        .select('*')
        .eq('document_id', documentId)
        .eq('user_id', userId),
    ]);

    // Update last_opened_at
    await supabase
      .from('documents')
      .update({ last_opened_at: new Date().toISOString() })
      .eq('id', documentId);

    return {
      document: mapSupabaseDocument(doc),
      bookmarks: (bookmarksRes.data || []).map(mapSupabaseBookmark),
      highlights: (highlightsRes.data || []).map(mapSupabaseHighlight),
    };
  } else {
    // Anonymous user
    const doc = await localDb.getDocument(documentId);
    if (!doc) return null;

    const bookmarks = await localDb.getBookmarksForDocument(documentId);
    const highlights = await localDb.getHighlightsForDocument(documentId);

    // Update last opened
    await localDb.updateDocument(documentId, {
      lastOpenedAt: new Date().toISOString(),
    });

    return {
      document: mapLocalDocument(doc),
      bookmarks: bookmarks.map(mapLocalBookmark),
      highlights: highlights.map(mapLocalHighlight),
    };
  }
}

export async function saveDocument(
  input: CreateDocumentInput,
  userId: string | null
): Promise<Document> {
  const contentHash = await hashContent(input.rawText);
  const tokens = tokenize(input.rawText);
  const wordCount = tokens.length;
  const now = new Date().toISOString();

  if (userId) {
    const supabase = createClient();

    // Check for duplicate
    const { data: existing } = await supabase
      .from('documents')
      .select('id')
      .eq('user_id', userId)
      .eq('content_hash', contentHash)
      .single();

    if (existing) {
      // Update last_opened_at and return existing
      await supabase
        .from('documents')
        .update({ last_opened_at: now })
        .eq('id', existing.id);

      const { data: doc } = await supabase
        .from('documents')
        .select('*')
        .eq('id', existing.id)
        .single();

      return mapSupabaseDocument(doc!);
    }

    // Create new document
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        title: input.title,
        content_hash: contentHash,
        word_count: wordCount,
        file_type: input.fileType,
        original_filename: input.originalFilename || null,
        raw_text: input.rawText,
        created_at: now,
        last_opened_at: now,
        is_archived: false,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save document: ${error.message}`);
    }

    return mapSupabaseDocument(data);
  } else {
    // Anonymous user - save to IndexedDB
    const existingDocs = await localDb.getAllDocuments();
    const existing = existingDocs.find((d) => d.contentHash === contentHash);

    if (existing) {
      await localDb.updateDocument(existing.id, { lastOpenedAt: now });
      return mapLocalDocument({ ...existing, lastOpenedAt: now });
    }

    const doc = await localDb.saveDocument({
      title: input.title,
      contentHash,
      wordCount,
      fileType: input.fileType,
      originalFilename: input.originalFilename || null,
      rawText: input.rawText,
      tokens,
      createdAt: now,
      lastOpenedAt: now,
      isArchived: false,
      bookmarks: [],
      highlights: [],
      lastPosition: 0,
    });

    return mapLocalDocument(doc);
  }
}

export async function archiveDocument(
  documentId: string,
  userId: string | null
): Promise<void> {
  if (userId) {
    const supabase = createClient();
    await supabase
      .from('documents')
      .update({ is_archived: true })
      .eq('id', documentId)
      .eq('user_id', userId);
  } else {
    await localDb.updateDocument(documentId, { isArchived: true });
  }
}

export async function deleteDocument(
  documentId: string,
  userId: string | null
): Promise<void> {
  if (userId) {
    const supabase = createClient();
    await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', userId);
  } else {
    await localDb.deleteDocument(documentId);
  }
}

// ==================== BOOKMARKS ====================

export async function addBookmark(
  documentId: string,
  tokenIndex: number,
  tokens: string[],
  userId: string | null,
  label?: string
): Promise<Bookmark> {
  // Generate context snippet (±5 words around the bookmark)
  const start = Math.max(0, tokenIndex - 5);
  const end = Math.min(tokens.length, tokenIndex + 6);
  const contextSnippet = tokens.slice(start, end).join(' ');
  const now = new Date().toISOString();

  if (userId) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: userId,
        document_id: documentId,
        token_index: tokenIndex,
        label: label || null,
        context_snippet: contextSnippet,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add bookmark: ${error.message}`);
    }

    return mapSupabaseBookmark(data);
  } else {
    const bookmark = await localDb.saveBookmark({
      documentId,
      tokenIndex,
      label: label || null,
      contextSnippet,
      createdAt: now,
    });
    return mapLocalBookmark(bookmark);
  }
}

export async function removeBookmark(
  bookmarkId: string,
  userId: string | null
): Promise<void> {
  if (userId) {
    const supabase = createClient();
    await supabase
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId)
      .eq('user_id', userId);
  } else {
    await localDb.deleteBookmark(bookmarkId);
  }
}

// ==================== HIGHLIGHTS ====================

export async function addHighlight(
  documentId: string,
  startIndex: number,
  endIndex: number,
  userId: string | null,
  color: string = 'yellow',
  note?: string
): Promise<Highlight> {
  const now = new Date().toISOString();

  if (userId) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('highlights')
      .insert({
        user_id: userId,
        document_id: documentId,
        start_index: startIndex,
        end_index: endIndex,
        color,
        note: note || null,
        created_at: now,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add highlight: ${error.message}`);
    }

    return mapSupabaseHighlight(data);
  } else {
    const highlight = await localDb.saveHighlight({
      documentId,
      startIndex,
      endIndex,
      color,
      note: note || null,
      createdAt: now,
    });
    return mapLocalHighlight(highlight);
  }
}

export async function removeHighlight(
  highlightId: string,
  userId: string | null
): Promise<void> {
  if (userId) {
    const supabase = createClient();
    await supabase
      .from('highlights')
      .delete()
      .eq('id', highlightId)
      .eq('user_id', userId);
  } else {
    await localDb.deleteHighlight(highlightId);
  }
}

// ==================== MAPPERS ====================

// Map Supabase document to our Document type
function mapSupabaseDocument(doc: Record<string, unknown>): Document {
  return {
    id: doc.id as string,
    userId: doc.user_id as string,
    title: doc.title as string,
    contentHash: doc.content_hash as string,
    wordCount: doc.word_count as number,
    fileType: doc.file_type as Document['fileType'],
    originalFilename: doc.original_filename as string | null,
    rawText: doc.raw_text as string,
    createdAt: doc.created_at as string,
    lastOpenedAt: doc.last_opened_at as string,
    isArchived: doc.is_archived as boolean,
  };
}

function mapLocalDocument(doc: LocalDocument): Document {
  return {
    id: doc.id,
    userId: '', // Local documents don't have a user ID
    title: doc.title,
    contentHash: doc.contentHash,
    wordCount: doc.wordCount,
    fileType: doc.fileType,
    originalFilename: doc.originalFilename,
    rawText: doc.rawText,
    createdAt: doc.createdAt,
    lastOpenedAt: doc.lastOpenedAt,
    isArchived: doc.isArchived,
  };
}

function mapSupabaseBookmark(bookmark: Record<string, unknown>): Bookmark {
  return {
    id: bookmark.id as string,
    userId: bookmark.user_id as string,
    documentId: bookmark.document_id as string,
    tokenIndex: bookmark.token_index as number,
    label: bookmark.label as string | null,
    contextSnippet: bookmark.context_snippet as string,
    createdAt: bookmark.created_at as string,
  };
}

function mapLocalBookmark(bookmark: LocalBookmark): Bookmark {
  return {
    id: bookmark.id,
    userId: '',
    documentId: bookmark.documentId,
    tokenIndex: bookmark.tokenIndex,
    label: bookmark.label,
    contextSnippet: bookmark.contextSnippet,
    createdAt: bookmark.createdAt,
  };
}

function mapSupabaseHighlight(highlight: Record<string, unknown>): Highlight {
  return {
    id: highlight.id as string,
    userId: highlight.user_id as string,
    documentId: highlight.document_id as string,
    startIndex: highlight.start_index as number,
    endIndex: highlight.end_index as number,
    color: highlight.color as string,
    note: highlight.note as string | null,
    createdAt: highlight.created_at as string,
  };
}

function mapLocalHighlight(highlight: LocalHighlight): Highlight {
  return {
    id: highlight.id,
    userId: '',
    documentId: highlight.documentId,
    startIndex: highlight.startIndex,
    endIndex: highlight.endIndex,
    color: highlight.color,
    note: highlight.note,
    createdAt: highlight.createdAt,
  };
}
