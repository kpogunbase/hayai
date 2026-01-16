"use client";

import { useState, useRef, useEffect } from "react";

interface Track {
  id: number;
  name: string;
}

interface AudioPlayerProps {
  currentTrack: Track;
  tracks: Track[];
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSelectTrack: (trackId: number) => void;
}

export function AudioPlayer({
  currentTrack,
  tracks,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  onNextTrack,
  onPrevTrack,
  onSelectTrack,
}: AudioPlayerProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        backgroundColor: "var(--bg-secondary)",
        borderRadius: "12px",
        border: "1px solid var(--border)",
      }}
    >
      {/* Music note icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "32px",
          height: "32px",
          backgroundColor: "var(--bg-tertiary)",
          borderRadius: "8px",
          color: "var(--accent)",
          flexShrink: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>

      {/* Track selector dropdown */}
      <div ref={dropdownRef} style={{ position: "relative", flex: 1, minWidth: 0 }}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 10px",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-primary)",
            backgroundColor: "var(--bg-tertiary)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border-strong)";
          }}
          onMouseLeave={(e) => {
            if (!isDropdownOpen) {
              e.currentTarget.style.borderColor = "var(--border)";
            }
          }}
        >
          <span
            style={{
              flex: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {currentTrack.name}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              flexShrink: 0,
              transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.15s",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 4px)",
              left: 0,
              right: 0,
              maxHeight: "200px",
              overflowY: "auto",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px var(--shadow-lg)",
              zIndex: 100,
            }}
          >
            {tracks.map((track) => (
              <button
                key={track.id}
                onClick={() => {
                  onSelectTrack(track.id);
                  setIsDropdownOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  fontSize: "13px",
                  color:
                    track.id === currentTrack.id
                      ? "var(--accent)"
                      : "var(--text-secondary)",
                  fontWeight: track.id === currentTrack.id ? 600 : 400,
                  backgroundColor:
                    track.id === currentTrack.id
                      ? "var(--bg-secondary)"
                      : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background-color 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (track.id !== currentTrack.id) {
                    e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (track.id !== currentTrack.id) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {track.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Prev/Next track buttons */}
      <div style={{ display: "flex", gap: "2px" }}>
        <button
          onClick={onPrevTrack}
          aria-label="Previous track"
          title="Previous track (,)"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            padding: 0,
            border: "none",
            borderRadius: "6px",
            backgroundColor: "transparent",
            color: "var(--text-tertiary)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-tertiary)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="19 20 9 12 19 4 19 20" />
            <line x1="5" y1="19" x2="5" y2="5" />
          </svg>
        </button>

        <button
          onClick={onNextTrack}
          aria-label="Next track"
          title="Next track (.)"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            padding: 0,
            border: "none",
            borderRadius: "6px",
            backgroundColor: "transparent",
            color: "var(--text-tertiary)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-tertiary)";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
      </div>

      {/* Volume controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <button
          onClick={onToggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
          title={isMuted ? "Unmute" : "Mute"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "28px",
            height: "28px",
            padding: 0,
            border: "none",
            borderRadius: "6px",
            backgroundColor: "transparent",
            color: isMuted ? "var(--text-tertiary)" : "var(--text-secondary)",
            cursor: "pointer",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isMuted ? "var(--text-tertiary)" : "var(--text-secondary)";
          }}
        >
          {isMuted || volume === 0 ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : volume < 0.5 ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={isMuted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          aria-label="Volume"
          style={{
            width: "70px",
            height: "20px",
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
}
