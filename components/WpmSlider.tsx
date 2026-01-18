"use client";

// Gradual increase stages: WPM values at each 20% interval
export const GRADUAL_STAGES = [300, 360, 450, 600, 900] as const;

interface WpmSliderProps {
  wpm: number;
  onChange: (wpm: number) => void;
  disabled?: boolean;
  gradualIncrease?: boolean;
  onGradualIncreaseChange?: (enabled: boolean) => void;
  currentStage?: number; // 0-4, shows which stage we're in when gradual is active
}

const MIN_WPM = 300;
const MAX_WPM = 900;
const STEP = 25;

export function WpmSlider({
  wpm,
  onChange,
  disabled = false,
  gradualIncrease = false,
  onGradualIncreaseChange,
  currentStage,
}: WpmSliderProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* Gradual Increase Toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <label
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Gradual Increase
          {gradualIncrease && currentStage !== undefined && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--accent)",
                background: "var(--accent-gradient-subtle)",
                padding: "2px 8px",
                borderRadius: "10px",
              }}
            >
              Stage {currentStage + 1}/5
            </span>
          )}
        </label>
        <button
          onClick={() => onGradualIncreaseChange?.(!gradualIncrease)}
          disabled={disabled}
          style={{
            position: "relative",
            width: "44px",
            height: "24px",
            backgroundColor: gradualIncrease ? "var(--accent)" : "var(--bg-tertiary)",
            border: "none",
            borderRadius: "12px",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "background-color 0.2s ease",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "2px",
              left: gradualIncrease ? "22px" : "2px",
              width: "20px",
              height: "20px",
              backgroundColor: "#fff",
              borderRadius: "50%",
              transition: "left 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </button>
      </div>

      {/* Stage indicators when gradual is enabled */}
      {gradualIncrease && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
          }}
        >
          {GRADUAL_STAGES.map((stageWpm, idx) => (
            <div
              key={stageWpm}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: currentStage === idx ? 700 : 500,
                  color: currentStage === idx ? "var(--accent)" :
                         currentStage !== undefined && idx < currentStage ? "var(--success)" : "var(--text-tertiary)",
                  transition: "all 0.2s ease",
                }}
              >
                {stageWpm}
              </span>
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: currentStage === idx ? "var(--accent)" :
                                   currentStage !== undefined && idx < currentStage ? "var(--success)" : "var(--border)",
                  transition: "all 0.2s ease",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* WPM Display and Slider - only show when gradual increase is off */}
      {!gradualIncrease && (
        <>
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
        </>
      )}
    </div>
  );
}
