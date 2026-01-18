"use client";

import { useEffect, useCallback } from "react";
import { useStatsStore } from "@/lib/stores/statsStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Format seconds into readable time
function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

export function AnalyticsModal({ isOpen, onClose }: AnalyticsModalProps) {
  const isMobile = useIsMobile();
  const getComputedStats = useStatsStore((s) => s.getComputedStats);
  const stats = getComputedStats();

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

  const statItems = [
    {
      label: "Passages Completed",
      value: stats.totalPassagesCompleted.toLocaleString(),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      highlight: true,
    },
    {
      label: "Total Words Read",
      value: stats.totalWordsRead.toLocaleString(),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      label: "Total Reading Time",
      value: formatTime(stats.totalReadingTimeSeconds),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      label: "Average WPM",
      value: stats.averageWpm.toLocaleString(),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
    },
  ];

  const periodStats = [
    { label: "Today", value: stats.wordsToday.toLocaleString() },
    { label: "This Week", value: stats.wordsThisWeek.toLocaleString() },
    { label: "This Month", value: stats.wordsThisMonth.toLocaleString() },
  ];

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
          maxWidth: isMobile ? "100%" : "420px",
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
            Reading Analytics
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
          {/* Main Stats Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            {statItems.map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: "16px",
                  backgroundColor: stat.highlight
                    ? "var(--success-bg)"
                    : "var(--bg-secondary)",
                  borderRadius: "12px",
                  border: stat.highlight
                    ? "1px solid var(--success-border)"
                    : "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                    color: stat.highlight ? "var(--success)" : "var(--text-tertiary)",
                  }}
                >
                  {stat.icon}
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: stat.highlight ? "var(--success)" : "var(--text-primary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: stat.highlight
                      ? "var(--success)"
                      : "var(--text-tertiary)",
                    marginTop: "4px",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Period Stats */}
          <div>
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
              Words Read
            </h3>
            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              {periodStats.map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-tertiary)",
                      marginTop: "4px",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
              Press <kbd style={kbdStyle}>A</kbd> anytime to view analytics
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

const kbdStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 6px",
  fontSize: "11px",
  fontFamily: "inherit",
  backgroundColor: "var(--bg-tertiary)",
  borderRadius: "4px",
  border: "1px solid var(--border)",
};
