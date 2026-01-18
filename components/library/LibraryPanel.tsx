"use client";

import { useEffect, useCallback, useState } from "react";
import { useLibraryStore } from "@/lib/stores/libraryStore";
import { useAuth } from "@/components/AuthProvider";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { getDocuments } from "@/lib/storage/documentStorage";
import { LibraryDocumentCard } from "./LibraryDocumentCard";
import { LibrarySearch } from "./LibrarySearch";
import { LibraryEmptyState } from "./LibraryEmptyState";
import type { Document } from "@/types/document";

interface LibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentSelect: (doc: { id: string; rawText: string; title: string }) => void;
}

export function LibraryPanel({ isOpen, onClose, onDocumentSelect }: LibraryPanelProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fetch documents when panel opens
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const docs = await getDocuments(user?.id || null);
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen, fetchDocuments]);

  // Filter documents by search query
  const filteredDocuments = documents.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      doc.title.toLowerCase().includes(query) ||
      (doc.originalFilename?.toLowerCase().includes(query) ?? false)
    );
  });

  // Handle document selection
  const handleSelectDocument = useCallback(
    (doc: Document) => {
      onDocumentSelect({
        id: doc.id,
        rawText: doc.rawText,
        title: doc.title,
      });
    },
    [onDocumentSelect]
  );

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Don't handle if typing in search
      if (e.target instanceof HTMLInputElement) {
        // Only handle escape in search input
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
        return;
      }

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredDocuments.length - 1)
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredDocuments.length > 0 && filteredDocuments[selectedIndex]) {
            handleSelectDocument(filteredDocuments[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filteredDocuments, selectedIndex, handleSelectDocument]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            zIndex: 40,
          }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "320px",
          maxWidth: "85vw",
          backgroundColor: "var(--bg-primary)",
          borderRight: "1px solid var(--border)",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 200ms ease",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Library
          </h2>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "transparent",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              transition: "background-color 150ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 16px" }}>
          <LibrarySearch value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 16px 16px",
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 0",
                color: "var(--text-secondary)",
                fontSize: "14px",
              }}
            >
              Loading...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <LibraryEmptyState hasSearchQuery={searchQuery.length > 0} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {filteredDocuments.map((doc, index) => (
                <LibraryDocumentCard
                  key={doc.id}
                  document={doc}
                  onClick={() => handleSelectDocument(doc)}
                  isSelected={index === selectedIndex}
                />
              ))}
            </div>
          )}
        </div>

        {/* Keyboard hint - hide on mobile */}
        {!isMobile && (
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid var(--border)",
              fontSize: "12px",
              color: "var(--text-tertiary)",
              textAlign: "center",
            }}
          >
            <kbd style={kbdStyle}>↑</kbd><kbd style={kbdStyle}>↓</kbd> Navigate <kbd style={kbdStyle}>Enter</kbd> Open <kbd style={kbdStyle}>Esc</kbd> Close
          </div>
        )}
      </div>
    </>
  );
}

const kbdStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 6px",
  fontSize: "11px",
  fontFamily: "inherit",
  backgroundColor: "var(--bg-tertiary)",
  borderRadius: "4px",
  border: "1px solid var(--border)",
};
