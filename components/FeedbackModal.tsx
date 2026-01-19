"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: "home" | "reader";
}

export function FeedbackModal({ isOpen, onClose, page }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { session } = useAuth();
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
      setFeedback("");
      setSubmitStatus("idle");
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async () => {
    if (!feedback.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const supabase = createClient();
      const { error } = await supabase.from("feedback").insert({
        user_id: session?.user?.id || null,
        content: feedback.trim(),
        page: page,
      });

      if (error) {
        console.error("Error submitting feedback:", error);
        setSubmitStatus("error");
      } else {
        setSubmitStatus("success");
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  }, [feedback, isSubmitting, session, page, onClose]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [onClose, handleSubmit]
  );

  if (!isOpen) return null;

  const charCount = feedback.length;

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
          maxWidth: isMobile ? "100%" : "500px",
          maxHeight: isMobile ? "85vh" : "80vh",
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
            Send Feedback
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
          {/* Description */}
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            We&apos;d love to hear your thoughts, suggestions, or bug reports.
          </p>

          {/* Text area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <textarea
              ref={textareaRef}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Type your feedback here..."
              style={{
                flex: 1,
                minHeight: "150px",
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

          {/* Character count */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                color: "var(--text-tertiary)",
              }}
            >
              {charCount.toLocaleString()} characters
            </span>
          </div>

          {/* Status messages */}
          {submitStatus === "success" && (
            <div
              style={{
                padding: "12px",
                background: "var(--success-bg)",
                border: "1px solid var(--success-border)",
                borderRadius: "8px",
                color: "var(--success)",
                fontSize: "14px",
                textAlign: "center",
                boxShadow: "var(--success-glow)",
              }}
            >
              Thank you for your feedback!
            </div>
          )}

          {submitStatus === "error" && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                color: "#ef4444",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              Failed to submit feedback. Please try again.
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
              disabled={!feedback.trim() || isSubmitting || submitStatus === "success"}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
                background:
                  !feedback.trim() || isSubmitting || submitStatus === "success"
                    ? "var(--text-tertiary)"
                    : "var(--accent-gradient)",
                border: "none",
                borderRadius: "8px",
                cursor:
                  !feedback.trim() || isSubmitting || submitStatus === "success"
                    ? "not-allowed"
                    : "pointer",
                transition: "all 150ms ease",
              }}
              onMouseEnter={(e) => {
                if (feedback.trim() && !isSubmitting && submitStatus !== "success") {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (feedback.trim() && !isSubmitting && submitStatus !== "success") {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {isSubmitting ? "Sending..." : "Send Feedback"}
            </button>
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
};
