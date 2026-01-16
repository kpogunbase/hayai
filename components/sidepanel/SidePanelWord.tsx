"use client";

import { memo, useState } from "react";

interface SidePanelWordProps {
  word: string;
  index: number;
  isCurrent: boolean;
  isHighlighted: boolean;
  isBookmarked: boolean;
  onClick: (index: number) => void;
}

export const SidePanelWord = memo(function SidePanelWord({
  word,
  index,
  isCurrent,
  isHighlighted,
  isBookmarked,
  onClick,
}: SidePanelWordProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine background color based on state
  let backgroundColor = "transparent";
  if (isCurrent) {
    backgroundColor = "var(--accent)";
  } else if (isHighlighted) {
    backgroundColor = "rgba(250, 204, 21, 0.3)"; // Yellow highlight
  } else if (isHovered) {
    backgroundColor = "var(--bg-tertiary)";
  }

  // Determine text color
  let color = "var(--text-secondary)";
  if (isCurrent) {
    color = "#fff";
  } else if (isHovered) {
    color = "var(--text-primary)";
  }

  return (
    <span style={{ position: "relative", display: "inline-flex" }} data-index={index}>
      {/* Bookmark indicator */}
      {isBookmarked && (
        <span
          style={{
            position: "absolute",
            top: "-2px",
            left: "-2px",
            width: "6px",
            height: "6px",
            backgroundColor: "var(--accent)",
            borderRadius: "50%",
          }}
          title="Bookmarked"
        />
      )}

      {/* Word button */}
      <button
        onClick={() => onClick(index)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          padding: "2px 4px",
          fontSize: "13px",
          lineHeight: 1.4,
          fontFamily: "inherit",
          color,
          backgroundColor,
          border: "none",
          borderRadius: "3px",
          cursor: "pointer",
          transition: "background-color 100ms ease, color 100ms ease",
          whiteSpace: "nowrap",
        }}
      >
        {word}
      </button>
    </span>
  );
});
