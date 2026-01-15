"use client";

interface ReaderControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onRestart: () => void;
  onBack: () => void;
  onForward: () => void;
  currentIndex: number;
  totalTokens: number;
}

function IconButton({
  onClick,
  label,
  children,
  primary = false,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: primary ? "56px" : "44px",
        height: primary ? "56px" : "44px",
        padding: 0,
        fontSize: "14px",
        border: primary ? "none" : "1px solid var(--border)",
        borderRadius: "50%",
        backgroundColor: primary ? "var(--accent)" : "var(--bg-secondary)",
        color: primary ? "#fff" : "var(--text-secondary)",
        cursor: "pointer",
        transition: "all 0.15s ease",
        boxShadow: primary ? "0 4px 12px var(--shadow-lg)" : "none",
      }}
      onMouseEnter={(e) => {
        if (primary) {
          e.currentTarget.style.backgroundColor = "var(--accent-hover)";
          e.currentTarget.style.transform = "scale(1.05)";
        } else {
          e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
          e.currentTarget.style.borderColor = "var(--border-strong)";
        }
      }}
      onMouseLeave={(e) => {
        if (primary) {
          e.currentTarget.style.backgroundColor = "var(--accent)";
          e.currentTarget.style.transform = "scale(1)";
        } else {
          e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
          e.currentTarget.style.borderColor = "var(--border)";
        }
      }}
    >
      {children}
    </button>
  );
}

export function ReaderControls({
  isPlaying,
  onPlayPause,
  onRestart,
  onBack,
  onForward,
  currentIndex,
  totalTokens,
}: ReaderControlsProps) {
  const progress = totalTokens > 0 ? ((currentIndex + 1) / totalTokens) * 100 : 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
        maxWidth: "400px",
      }}
    >
      {/* Progress bar */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--text-secondary)",
            }}
          >
            Progress
          </span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-primary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {currentIndex + 1} / {totalTokens}
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: "6px",
            backgroundColor: "var(--bg-tertiary)",
            borderRadius: "3px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "var(--accent)",
              borderRadius: "3px",
              transition: "width 0.15s ease-out",
            }}
          />
        </div>
      </div>

      {/* Control buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <IconButton onClick={onRestart} label="Restart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
        </IconButton>

        <IconButton onClick={onBack} label="Back 10 words">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="11 17 6 12 11 7" />
            <polyline points="18 17 13 12 18 7" />
          </svg>
        </IconButton>

        <IconButton onClick={onPlayPause} label={isPlaying ? "Pause" : "Play"} primary>
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v14.72a1 1 0 0 0 1.5.86l11-7.36a1 1 0 0 0 0-1.72l-11-7.36a1 1 0 0 0-1.5.86z" />
            </svg>
          )}
        </IconButton>

        <IconButton onClick={onForward} label="Forward 10 words">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="13 17 18 12 13 7" />
            <polyline points="6 17 11 12 6 7" />
          </svg>
        </IconButton>
      </div>
    </div>
  );
}
