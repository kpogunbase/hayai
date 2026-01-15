"use client";

interface WpmSliderProps {
  wpm: number;
  onChange: (wpm: number) => void;
  disabled?: boolean;
}

const MIN_WPM = 300;
const MAX_WPM = 900;
const STEP = 25;

export function WpmSlider({ wpm, onChange, disabled = false }: WpmSliderProps) {
  const percentage = ((wpm - MIN_WPM) / (MAX_WPM - MIN_WPM)) * 100;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <label
          htmlFor="wpm-slider"
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-secondary)",
          }}
        >
          Reading Speed
        </label>
        <span
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--text-primary)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {wpm} <span style={{ fontWeight: 400, color: "var(--text-tertiary)" }}>WPM</span>
        </span>
      </div>

      <div style={{ position: "relative" }}>
        <input
          id="wpm-slider"
          type="range"
          min={MIN_WPM}
          max={MAX_WPM}
          step={STEP}
          value={wpm}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          style={{
            width: "100%",
            height: "24px",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
          }}
        />

        {/* Tick marks */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "4px",
            padding: "0 2px",
          }}
        >
          <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>300</span>
          <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>600</span>
          <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>900</span>
        </div>
      </div>
    </div>
  );
}
