"use client";

import { ChallengeDuration, CHALLENGE_DURATIONS } from "@/lib/reader/ramp";

export type ReaderMode = "reading" | "challenge";

interface ModeSelectorProps {
  mode: ReaderMode;
  challengeDuration: ChallengeDuration;
  onModeChange: (mode: ReaderMode) => void;
  onDurationChange: (duration: ChallengeDuration) => void;
  disabled?: boolean;
}

const DURATION_LABELS: Record<ChallengeDuration, string> = {
  "2min": "2 min",
  "3min": "3 min",
  "5min": "5 min",
};

export function ModeSelector({
  mode,
  challengeDuration,
  onModeChange,
  onDurationChange,
  disabled = false,
}: ModeSelectorProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Mode toggle */}
      <div
        style={{
          display: "flex",
          backgroundColor: "var(--bg-tertiary)",
          borderRadius: "10px",
          padding: "4px",
        }}
      >
        <button
          onClick={() => onModeChange("reading")}
          disabled={disabled}
          style={{
            flex: 1,
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: 500,
            border: "none",
            borderRadius: "8px",
            cursor: disabled ? "not-allowed" : "pointer",
            backgroundColor: mode === "reading" ? "var(--bg-primary)" : "transparent",
            color: mode === "reading" ? "var(--text-primary)" : "var(--text-secondary)",
            boxShadow: mode === "reading" ? "0 1px 3px var(--shadow)" : "none",
            transition: "all 0.15s ease",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          Reading
        </button>
        <button
          onClick={() => onModeChange("challenge")}
          disabled={disabled}
          style={{
            flex: 1,
            padding: "10px 16px",
            fontSize: "14px",
            fontWeight: 500,
            border: "none",
            borderRadius: "8px",
            cursor: disabled ? "not-allowed" : "pointer",
            backgroundColor: mode === "challenge" ? "var(--bg-primary)" : "transparent",
            color: mode === "challenge" ? "var(--text-primary)" : "var(--text-secondary)",
            boxShadow: mode === "challenge" ? "0 1px 3px var(--shadow)" : "none",
            transition: "all 0.15s ease",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          Challenge
        </button>
      </div>

      {/* Duration selector (only visible in challenge mode) */}
      {mode === "challenge" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {(Object.keys(CHALLENGE_DURATIONS) as ChallengeDuration[]).map((dur) => (
            <button
              key={dur}
              onClick={() => onDurationChange(dur)}
              disabled={disabled}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 500,
                border: `1px solid ${challengeDuration === dur ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "6px",
                cursor: disabled ? "not-allowed" : "pointer",
                backgroundColor: challengeDuration === dur ? "var(--accent)" : "transparent",
                color: challengeDuration === dur ? "#fff" : "var(--text-secondary)",
                transition: "all 0.15s ease",
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {DURATION_LABELS[dur]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
