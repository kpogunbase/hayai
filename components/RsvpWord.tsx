"use client";

import { splitAtOrp } from "@/lib/reader/orp";

interface RsvpWordProps {
  token: string;
}

/**
 * RsvpWord displays a single token with ORP highlighting.
 *
 * Layout strategy:
 * - Use fixed-width containers for left/right portions
 * - ORP character is always centered and highlighted
 * - This keeps the ORP position stable across different word lengths
 */
export function RsvpWord({ token }: RsvpWordProps) {
  const { left, orp, right } = splitAtOrp(token);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "var(--font-inter), ui-monospace, monospace",
        fontSize: "clamp(40px, 8vw, 64px)",
        fontWeight: 500,
        letterSpacing: "0.02em",
        minHeight: "100px",
        userSelect: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Left portion: right-aligned to ORP */}
        <span
          style={{
            display: "inline-block",
            minWidth: "4ch",
            textAlign: "right",
            color: "var(--text-primary)",
            opacity: 0.9,
          }}
        >
          {left}
        </span>

        {/* ORP character: emphasized */}
        <span
          style={{
            display: "inline-block",
            color: "var(--orp-highlight)",
            fontWeight: 600,
            textShadow: "0 0 20px var(--orp-highlight)",
          }}
        >
          {orp}
        </span>

        {/* Right portion: left-aligned from ORP */}
        <span
          style={{
            display: "inline-block",
            minWidth: "8ch",
            textAlign: "left",
            color: "var(--text-primary)",
            opacity: 0.9,
          }}
        >
          {right}
        </span>
      </div>
    </div>
  );
}
