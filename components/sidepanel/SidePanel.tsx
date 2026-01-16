"use client";

import { useCallback, useRef, useEffect } from "react";
import { SidePanelWord } from "./SidePanelWord";

const WORDS_PER_LINE = 8;

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: string[];
  currentIndex: number;
  bookmarkedIndices: Set<number>;
  highlightedIndices: Set<number>;
  onWordClick: (index: number) => void;
}

export function SidePanel({
  isOpen,
  onClose,
  tokens,
  currentIndex,
  bookmarkedIndices,
  highlightedIndices,
  onWordClick,
}: SidePanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll to current position when it changes
  useEffect(() => {
    if (isOpen && contentRef.current) {
      // Find the current word element and scroll to it
      const currentWordElement = contentRef.current.querySelector(
        `[data-index="${currentIndex}"]`
      );
      if (currentWordElement) {
        currentWordElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentIndex, isOpen]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(() => {
    onClose();
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Group tokens into lines for display
  const lines: { startIndex: number; words: string[] }[] = [];
  for (let i = 0; i < tokens.length; i += WORDS_PER_LINE) {
    lines.push({
      startIndex: i,
      words: tokens.slice(i, i + WORDS_PER_LINE),
    });
  }

  return (
    <>
      {/* Backdrop - no backdrop click close for smoother UX */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
          }}
          onClick={handleBackdropClick}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "360px",
          maxWidth: "85vw",
          backgroundColor: "var(--bg-primary)",
          borderLeft: "1px solid var(--border)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
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
            Document
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

        {/* Progress indicator */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
            fontSize: "13px",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>
            Word {currentIndex + 1} of {tokens.length}
          </span>
          <span>
            {tokens.length > 0
              ? Math.round(((currentIndex + 1) / tokens.length) * 100)
              : 0}
            %
          </span>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          style={{
            flex: 1,
            padding: "16px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {tokens.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px 2px",
                lineHeight: 1.6,
              }}
            >
              {tokens.map((word, idx) => (
                <SidePanelWord
                  key={idx}
                  word={word}
                  index={idx}
                  isCurrent={idx === currentIndex}
                  isHighlighted={highlightedIndices.has(idx)}
                  isBookmarked={bookmarkedIndices.has(idx)}
                  onClick={onWordClick}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--text-tertiary)",
                fontSize: "14px",
              }}
            >
              No document loaded
            </div>
          )}
        </div>

        {/* Keyboard hint */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--border)",
            fontSize: "12px",
            color: "var(--text-tertiary)",
            textAlign: "center",
          }}
        >
          Press <kbd style={kbdStyle}>S</kbd> or <kbd style={kbdStyle}>Esc</kbd> to close
        </div>
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
