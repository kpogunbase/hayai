"use client";

import { useEffect } from "react";
import { useStatsStore } from "@/lib/stores/statsStore";
import { StatCard } from "./StatCard";

interface StatsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatsPanel({ isOpen, onClose }: StatsPanelProps) {
  const getComputedStats = useStatsStore((s) => s.getComputedStats);
  const stats = getComputedStats();

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Format time
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  // Format number
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: "320px",
          backgroundColor: "var(--bg-primary)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          boxShadow: "0 10px 40px -10px var(--shadow-lg)",
          zIndex: 50,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Reading Stats
          </h3>
        </div>

        {/* Content */}
        <div style={{ padding: "16px" }}>
          {/* Overview cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <StatCard
              label="Total Words"
              value={formatNumber(stats.totalWordsRead)}
              icon="📖"
            />
            <StatCard
              label="Documents"
              value={stats.totalDocumentsRead.toString()}
              icon="📚"
            />
            <StatCard
              label="Reading Time"
              value={formatTime(stats.totalReadingTimeSeconds)}
              icon="⏱️"
            />
            <StatCard
              label="Avg. WPM"
              value={stats.averageWpm.toString()}
              icon="⚡"
            />
          </div>

          {/* Time-based stats */}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "16px",
            }}
          >
            <h4
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "0 0 12px",
              }}
            >
              Words Read
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <StatRow label="Today" value={formatNumber(stats.wordsToday)} />
              <StatRow label="This Week" value={formatNumber(stats.wordsThisWeek)} />
              <StatRow label="This Month" value={formatNumber(stats.wordsThisMonth)} />
              <StatRow label="This Year" value={formatNumber(stats.wordsThisYear)} />
            </div>
          </div>

          {/* Averages */}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "16px",
              marginTop: "16px",
            }}
          >
            <h4
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "0 0 12px",
              }}
            >
              Averages
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <StatRow
                label="Per Day"
                value={`${formatNumber(stats.averageWordsPerDay)} words`}
              />
              <StatRow
                label="Per Week"
                value={`${formatNumber(stats.averageWordsPerWeek)} words`}
              />
              <StatRow
                label="Per Month"
                value={`${formatNumber(stats.averageWordsPerMonth)} words`}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "13px",
      }}
    >
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span
        style={{
          color: "var(--text-primary)",
          fontWeight: 500,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}
