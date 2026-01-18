"use client";

import { useEffect, useCallback } from "react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const shortcutGroups: ShortcutGroup[] = [
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
  },
  {
    title: "Audio",
    shortcuts: [
      { keys: [","], description: "Previous track" },
      { keys: ["."], description: "Next track" },
    ],
  },
  {
    title: "Panels",
    shortcuts: [
      { keys: ["S"], description: "Toggle side panel" },
      { keys: ["L"], description: "Toggle library" },
      { keys: ["Esc"], description: "Close open panel" },
    ],
  },
  {
    title: "Annotations",
    shortcuts: [
      { keys: ["B"], description: "Add bookmark" },
      { keys: ["H"], description: "Start / end highlight" },
    ],
  },
  {
    title: "Other",
    shortcuts: [
      { keys: ["F"], description: "Send feedback" },
      { keys: ["?"], description: "Show this help" },
    ],
  },
];

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  // Close on escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
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
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "var(--bg-primary)",
          borderRadius: "16px",
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
          style={{
            padding: "24px",
            maxHeight: "60vh",
            overflowY: "auto",
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

        {/* Footer */}
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
            Press <kbd style={footerKbdStyle}>?</kbd> anytime to show this help
          </p>
        </div>
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
