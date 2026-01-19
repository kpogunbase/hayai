"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface PasteTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, title: string) => void;
  isLoading?: boolean;
}

const MIN_WORDS = 10;
const MAX_CHARS = 500000; // 500KB of text

export function PasteTextModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: PasteTextModalProps) {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPasting, setIsPasting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setText("");
      setTitle("");
      setError(null);
      setIsPasting(false);
    }
  }, [isOpen]);

  // Calculate word count
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  // Validate text input
  const validateText = useCallback((input: string): string | null => {
    const trimmed = input.trim();

    if (!trimmed) {
      return "Please enter or paste some text to read.";
    }

    if (trimmed.length > MAX_CHARS) {
      const charCount = (trimmed.length / 1000).toFixed(0);
      return `Text is too long (${charCount}K characters). Maximum is 500K characters.`;
    }

    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    if (words.length < MIN_WORDS) {
      return `Please enter at least ${MIN_WORDS} words. Current: ${words.length} word${words.length === 1 ? "" : "s"}.`;
    }

    return null;
  }, []);

  // Handle text change with validation
  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  }, [error]);

  // Handle paste from clipboard (mobile-friendly)
  const handlePasteFromClipboard = useCallback(async () => {
    setIsPasting(true);
    setError(null);

    try {
      // Check if clipboard API is available
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        setError("Clipboard access not available. Please paste manually using your device's paste function.");
        return;
      }

      const clipboardText = await navigator.clipboard.readText();

      if (!clipboardText || !clipboardText.trim()) {
        setError("Clipboard is empty. Copy some text first, then try again.");
        return;
      }

      setText(prev => prev + clipboardText);
      textareaRef.current?.focus();
    } catch (err) {
      console.error("Clipboard read error:", err);
      // Handle common clipboard errors
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Clipboard access denied. Please paste manually using long-press or Ctrl/Cmd+V.");
        } else if (err.name === "SecurityError") {
          setError("Clipboard access blocked by browser. Please paste manually.");
        } else {
          setError("Could not read clipboard. Please paste manually using long-press or Ctrl/Cmd+V.");
        }
      } else {
        setError("Could not read clipboard. Please paste manually.");
      }
    } finally {
      setIsPasting(false);
    }
  }, []);

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (isLoading) return;

    const validationError = validateText(text);
    if (validationError) {
      setError(validationError);
      return;
    }

    const finalTitle =
      title.trim() ||
      `Pasted Text - ${new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    onSubmit(text.trim(), finalTitle);
  }, [text, title, isLoading, onSubmit, validateText]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        handleSubmit();
      }
    },
    [onClose, handleSubmit]
  );

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
      onKeyDown={handleKeyDown}
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
          maxWidth: isMobile ? "100%" : "600px",
          maxHeight: isMobile ? "90vh" : "80vh",
          backgroundColor: "var(--bg-primary)",
          borderRadius: isMobile ? "16px 16px 0 0" : "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
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
            Paste Text
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
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Title input */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--text-secondary)",
                marginBottom: "6px",
              }}
            >
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title..."
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "14px",
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                outline: "none",
                transition: "border-color 150ms ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            />
          </div>

          {/* Text area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--text-secondary)",
                marginBottom: "6px",
              }}
            >
              Text content
            </label>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your text here..."
              style={{
                flex: 1,
                minHeight: "200px",
                padding: "12px",
                fontSize: "14px",
                lineHeight: 1.6,
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                transition: "border-color 150ms ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            />
          </div>

          {/* Word count */}
          <div
            style={{
              fontSize: "13px",
              color: "var(--text-tertiary)",
            }}
          >
            {wordCount.toLocaleString()} words
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: isMobile ? "12px 16px" : "16px 24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile ? "flex-end" : "space-between",
          }}
        >
          {!isMobile && (
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-tertiary)",
              }}
            >
              <kbd style={kbdStyle}>⌘</kbd> + <kbd style={kbdStyle}>Enter</kbd> to submit
            </span>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={onClose}
              style={{
                padding: "10px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--text-secondary)",
                backgroundColor: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || isLoading}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
                background:
                  !text.trim() || isLoading
                    ? "var(--text-tertiary)"
                    : "var(--accent-gradient)",
                border: "none",
                borderRadius: "8px",
                cursor: !text.trim() || isLoading ? "not-allowed" : "pointer",
                transition: "all 150ms ease",
              }}
              onMouseEnter={(e) => {
                if (text.trim() && !isLoading) {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (text.trim() && !isLoading) {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {isLoading ? "Processing..." : "Start Reading"}
            </button>
          </div>
        </div>
      </div>
    </div>
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
