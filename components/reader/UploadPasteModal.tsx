"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { UploadDropzone, UploadDropzoneRef } from "@/components/UploadDropzone";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useAuth } from "@/components/AuthProvider";
import { parseFile } from "@/lib/parse";
import { tokenize } from "@/lib/tokenize";
import { saveDocument } from "@/lib/storage/documentStorage";

interface UploadPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContentLoaded: (documentId: string, tokens: string[], rawText: string) => void;
}

type TabType = "upload" | "paste";

const MIN_WORDS = 10;
const MAX_CHARS = 500000; // 500KB of text

export function UploadPasteModal({
  isOpen,
  onClose,
  onContentLoaded,
}: UploadPasteModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paste tab state
  const [pasteText, setPasteText] = useState("");
  const [pasteTitle, setPasteTitle] = useState("");
  const [isPasting, setIsPasting] = useState(false);

  const uploadRef = useRef<UploadDropzoneRef>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPasteText("");
      setPasteTitle("");
      setError(null);
      setIsLoading(false);
      setIsPasting(false);
      setActiveTab("upload");
    }
  }, [isOpen]);

  // Focus textarea when switching to paste tab
  useEffect(() => {
    if (isOpen && activeTab === "paste" && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen, activeTab]);

  // Calculate word count for paste
  const wordCount = pasteText.trim() ? pasteText.trim().split(/\s+/).length : 0;

  // Validate paste text
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

  // Handle file upload
  const handleFileSelected = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const text = await parseFile(file);
      const tokens = tokenize(text);

      if (tokens.length === 0) {
        setError("No readable text found in the file.");
        setIsLoading(false);
        return;
      }

      // Get file type from extension
      const ext = file.name.split(".").pop()?.toLowerCase() || "txt";

      // Save to library
      const doc = await saveDocument({
        title: file.name,
        fileType: ext as "txt" | "docx" | "pdf" | "epub" | "paste",
        originalFilename: file.name,
        rawText: text,
      }, user?.id ?? null);

      onContentLoaded(doc.id, tokens, text);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process file.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, onContentLoaded, onClose]);

  // Handle paste submit
  const handlePasteSubmit = useCallback(async () => {
    if (isLoading) return;

    const validationError = validateText(pasteText);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const text = pasteText.trim();
      const tokens = tokenize(text);

      const finalTitle = pasteTitle.trim() ||
        `Pasted Text - ${new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;

      // Save to library
      const doc = await saveDocument({
        title: finalTitle,
        fileType: "paste",
        rawText: text,
      }, user?.id ?? null);

      onContentLoaded(doc.id, tokens, text);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process text.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [pasteText, pasteTitle, isLoading, validateText, user?.id, onContentLoaded, onClose]);

  // Handle paste from clipboard
  const handlePasteFromClipboard = useCallback(async () => {
    setIsPasting(true);
    setError(null);

    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        setError("Clipboard access not available. Please paste manually.");
        return;
      }

      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText || !clipboardText.trim()) {
        setError("Clipboard is empty. Copy some text first, then try again.");
        return;
      }

      setPasteText(prev => prev + clipboardText);
      textareaRef.current?.focus();
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("Clipboard access denied. Please paste manually using Ctrl/Cmd+V.");
        } else {
          setError("Could not read clipboard. Please paste manually.");
        }
      } else {
        setError("Could not read clipboard. Please paste manually.");
      }
    } finally {
      setIsPasting(false);
    }
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    // Don't handle if typing in textarea (except for submit shortcuts)
    const isInTextarea = e.target instanceof HTMLTextAreaElement;
    const isInInput = e.target instanceof HTMLInputElement;

    // Escape to close
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }

    // Cmd/Ctrl+Enter to submit (only in paste tab with textarea focused)
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && activeTab === "paste") {
      e.preventDefault();
      handlePasteSubmit();
      return;
    }

    // Don't process other shortcuts when typing
    if (isInTextarea || isInInput) return;

    // Tab to switch tabs
    if (e.key === "Tab" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      setActiveTab(prev => prev === "upload" ? "paste" : "upload");
      return;
    }

    // 1 for upload tab
    if (e.key === "1") {
      e.preventDefault();
      setActiveTab("upload");
      return;
    }

    // 2 for paste tab
    if (e.key === "2") {
      e.preventDefault();
      setActiveTab("paste");
      return;
    }

    // Shift+U to trigger file upload
    if (e.shiftKey && e.key.toLowerCase() === "u") {
      e.preventDefault();
      setActiveTab("upload");
      setTimeout(() => uploadRef.current?.triggerUpload(), 50);
      return;
    }

    // Shift+P to switch to paste and focus textarea
    if (e.shiftKey && e.key.toLowerCase() === "p") {
      e.preventDefault();
      setActiveTab("paste");
      setTimeout(() => textareaRef.current?.focus(), 50);
      return;
    }
  }, [isOpen, onClose, activeTab, handlePasteSubmit]);

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
        style={{
          position: "relative",
          width: "100%",
          maxWidth: isMobile ? "100%" : "560px",
          maxHeight: isMobile ? "90vh" : "80vh",
          backgroundColor: "var(--bg-primary)",
          borderRadius: isMobile ? "16px 16px 0 0" : "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
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
            Load New Content
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

        {/* Tab selector */}
        <div
          style={{
            display: "flex",
            margin: "16px 24px 0",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "10px",
            padding: "4px",
          }}
        >
          <button
            onClick={() => setActiveTab("upload")}
            style={{
              flex: 1,
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: 500,
              color: activeTab === "upload" ? "var(--text-primary)" : "var(--text-secondary)",
              backgroundColor: activeTab === "upload" ? "var(--bg-primary)" : "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: activeTab === "upload" ? "0 1px 3px var(--shadow)" : "none",
            }}
          >
            Upload File
          </button>
          <button
            onClick={() => setActiveTab("paste")}
            style={{
              flex: 1,
              padding: "10px 16px",
              fontSize: "14px",
              fontWeight: 500,
              color: activeTab === "paste" ? "var(--text-primary)" : "var(--text-secondary)",
              backgroundColor: activeTab === "paste" ? "var(--bg-primary)" : "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: activeTab === "paste" ? "0 1px 3px var(--shadow)" : "none",
            }}
          >
            Paste Text
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
          }}
        >
          {activeTab === "upload" ? (
            <UploadDropzone
              ref={uploadRef}
              onFileSelected={handleFileSelected}
              isLoading={isLoading}
              error={error}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
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
                  value={pasteTitle}
                  onChange={(e) => setPasteTitle(e.target.value)}
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                    }}
                  >
                    Text content
                  </label>
                  <button
                    onClick={handlePasteFromClipboard}
                    disabled={isPasting}
                    style={{
                      padding: "4px 10px",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      backgroundColor: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                      borderRadius: "6px",
                      cursor: isPasting ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      opacity: isPasting ? 0.7 : 1,
                      transition: "all 150ms ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!isPasting) {
                        e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isPasting) {
                        e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                      }
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    {isPasting ? "Pasting..." : "Paste"}
                  </button>
                </div>
                <textarea
                  ref={textareaRef}
                  value={pasteText}
                  onChange={(e) => {
                    setPasteText(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Paste or type your text here..."
                  style={{
                    flex: 1,
                    minHeight: "180px",
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

              {/* Error message */}
              {error && (
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "rgba(220, 38, 38, 0.1)",
                    border: "1px solid rgba(220, 38, 38, 0.2)",
                    borderRadius: "8px",
                    color: "#dc2626",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          )}
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
              {activeTab === "upload" ? (
                <>
                  <kbd style={kbdStyle}>⇧</kbd><kbd style={kbdStyle}>U</kbd> upload
                  {" · "}
                  <kbd style={kbdStyle}>Tab</kbd> switch
                </>
              ) : (
                <>
                  <kbd style={kbdStyle}>⌘</kbd><kbd style={kbdStyle}>Enter</kbd> submit
                  {" · "}
                  <kbd style={kbdStyle}>Tab</kbd> switch
                </>
              )}
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
            {activeTab === "paste" && (
              <button
                onClick={handlePasteSubmit}
                disabled={!pasteText.trim() || isLoading}
                style={{
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fff",
                  background:
                    !pasteText.trim() || isLoading
                      ? "var(--text-tertiary)"
                      : "var(--accent-gradient)",
                  border: "none",
                  borderRadius: "8px",
                  cursor: !pasteText.trim() || isLoading ? "not-allowed" : "pointer",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={(e) => {
                  if (pasteText.trim() && !isLoading) {
                    e.currentTarget.style.opacity = "0.9";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (pasteText.trim() && !isLoading) {
                    e.currentTarget.style.opacity = "1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {isLoading ? "Processing..." : "Start Reading"}
              </button>
            )}
          </div>
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

const kbdStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 6px",
  fontSize: "11px",
  fontFamily: "inherit",
  backgroundColor: "var(--bg-tertiary)",
  borderRadius: "4px",
  border: "1px solid var(--border)",
  marginRight: "2px",
};
