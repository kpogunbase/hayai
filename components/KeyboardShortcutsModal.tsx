"use client";

import { useEffect, useCallback, useMemo, useRef } from "react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

type PageContext = "home" | "reader";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  page?: PageContext;
}

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
  pages?: PageContext[]; // If undefined, shows on all pages
}

const allShortcutGroups: ShortcutGroup[] = [
  {
    title: "Home Page",
    shortcuts: [
      { keys: ["Tab"], description: "Switch upload / paste" },
      { keys: ["1", "2"], description: "Select input method" },
      { keys: ["⇧", "U"], description: "Upload file" },
      { keys: ["⇧", "P"], description: "Paste text" },
      { keys: ["T"], description: "Cycle theme" },
    ],
    pages: ["home"],
  },
  {
    title: "Mode Selection",
    shortcuts: [
      { keys: ["1"], description: "Reading mode" },
      { keys: ["2"], description: "Challenge mode" },
      { keys: ["Enter"], description: "Start reading" },
      { keys: ["N"], description: "Upload new file" },
    ],
    pages: ["home"],
  },
  {
    title: "Playback",
    shortcuts: [
      { keys: ["Space"], description: "Play / Pause" },
      { keys: ["←"], description: "Back 10 words" },
      { keys: ["→"], description: "Forward 10 words" },
      { keys: ["R"], description: "Restart from beginning" },
      { keys: ["G"], description: "Toggle gradual increase" },
      { keys: ["+"], description: "Increase WPM (+25)" },
      { keys: ["-"], description: "Decrease WPM (-25)" },
    ],
    pages: ["reader"],
  },
  {
    title: "Modes",
    shortcuts: [
      { keys: ["M"], description: "Toggle Reading / Challenge" },
    ],
    pages: ["reader"],
  },
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["U"], description: "Upload / paste new content" },
      { keys: ["N"], description: "Go home" },
    ],
    pages: ["reader"],
  },
  {
    title: "Audio",
    shortcuts: [
      { keys: [","], description: "Previous track" },
      { keys: ["."], description: "Next track" },
    ],
    pages: ["reader"],
  },
  {
    title: "Panels & Navigation",
    shortcuts: [
      { keys: ["L"], description: "Toggle library" },
      { keys: ["↑", "↓"], description: "Navigate library items" },
      { keys: ["Enter"], description: "Open selected document" },
      { keys: ["Esc"], description: "Close open panel" },
    ],
    pages: ["home"],
  },
  {
    title: "Panels",
    shortcuts: [
      { keys: ["S"], description: "Toggle side panel" },
      { keys: ["L"], description: "Toggle library" },
      { keys: ["↑", "↓"], description: "Navigate library items" },
      { keys: ["Enter"], description: "Open selected document" },
      { keys: ["Esc"], description: "Close open panel" },
    ],
    pages: ["reader"],
  },
  {
    title: "Annotations",
    shortcuts: [
      { keys: ["B"], description: "Add bookmark" },
      { keys: ["H"], description: "Start / end highlight" },
    ],
    pages: ["reader"],
  },
  {
    title: "Other",
    shortcuts: [
      { keys: ["A"], description: "View analytics" },
      { keys: ["F"], description: "Send feedback" },
      { keys: ["⌘", ","], description: "Profile settings" },
      { keys: ["?"], description: "Show this help" },
    ],
  },
];

// Scroll amount per key press (in pixels)
const SCROLL_AMOUNT = 80;

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  page = "reader",
}: KeyboardShortcutsModalProps) {
  const isMobile = useIsMobile();
  const contentRef = useRef<HTMLDivElement>(null);

  // Filter shortcuts based on page context
  const shortcutGroups = useMemo(() => {
    return allShortcutGroups.filter(
      (group) => !group.pages || group.pages.includes(page)
    );
  }, [page]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowDown":
        case "j": // Vim-style navigation
          e.preventDefault();
          if (contentRef.current) {
            contentRef.current.scrollBy({ top: SCROLL_AMOUNT, behavior: "smooth" });
          }
          break;
        case "ArrowUp":
        case "k": // Vim-style navigation
          e.preventDefault();
          if (contentRef.current) {
            contentRef.current.scrollBy({ top: -SCROLL_AMOUNT, behavior: "smooth" });
          }
          break;
        case "Home":
          e.preventDefault();
          if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
          }
          break;
        case "End":
          e.preventDefault();
          if (contentRef.current) {
            contentRef.current.scrollTo({ top: contentRef.current.scrollHeight, behavior: "smooth" });
          }
          break;
        case "PageDown":
          e.preventDefault();
          if (contentRef.current) {
            contentRef.current.scrollBy({ top: contentRef.current.clientHeight * 0.8, behavior: "smooth" });
          }
          break;
        case "PageUp":
          e.preventDefault();
          if (contentRef.current) {
            contentRef.current.scrollBy({ top: -contentRef.current.clientHeight * 0.8, behavior: "smooth" });
          }
          break;
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Focus content area when modal opens for immediate keyboard access
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        padding: isMobile ? "0" : "24px",
        zIndex: 100,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div
        data-onboarding="shortcuts-modal"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: isMobile ? "100%" : "480px",
          maxHeight: isMobile ? "80vh" : "auto",
          backgroundColor: "var(--bg-primary)",
          borderRadius: isMobile ? "16px 16px 0 0" : "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          animation: "modalSlideIn 200ms ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
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
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "none",
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              transition: "background-color 150ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          tabIndex={0}
          style={{
            padding: "24px",
            maxHeight: "60vh",
            overflowY: "auto",
            outline: "none",
          }}
        >
          {shortcutGroups.map((group, groupIndex) => (
            <div
              key={group.title}
              style={{
                marginBottom: groupIndex < shortcutGroups.length - 1 ? "24px" : 0,
              }}
            >
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  margin: "0 0 12px",
                }}
              >
                {group.title}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {shortcut.description}
                    </span>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {shortcut.keys.map((key) => (
                        <kbd
                          key={key}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: "28px",
                            height: "28px",
                            padding: "0 8px",
                            fontSize: "12px",
                            fontWeight: 500,
                            fontFamily: "inherit",
                            color: "var(--text-primary)",
                            backgroundColor: "var(--bg-secondary)",
                            border: "1px solid var(--border)",
                            borderRadius: "6px",
                            boxShadow: "0 1px 2px var(--shadow)",
                          }}
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer - hide on mobile */}
        {!isMobile && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid var(--border)",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-tertiary)",
                margin: 0,
                textAlign: "center",
              }}
            >
              <kbd style={footerKbdStyle}>↑</kbd> <kbd style={footerKbdStyle}>↓</kbd> scroll
              {" · "}
              <kbd style={footerKbdStyle}>Esc</kbd> close
              {" · "}
              <kbd style={footerKbdStyle}>?</kbd> to reopen
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

const footerKbdStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 6px",
  fontSize: "11px",
  fontFamily: "inherit",
  backgroundColor: "var(--bg-tertiary)",
  borderRadius: "4px",
  border: "1px solid var(--border)",
};
