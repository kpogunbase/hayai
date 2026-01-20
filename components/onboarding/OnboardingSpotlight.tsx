"use client";

import { useEffect, useState, useRef } from "react";

interface OnboardingSpotlightProps {
  targetRect: DOMRect | null;
  padding?: number;
  allowInteraction?: boolean;
}

export function OnboardingSpotlight({
  targetRect,
  padding = 12,
  allowInteraction = false,
}: OnboardingSpotlightProps) {
  const [isAnimated, setIsAnimated] = useState(false);
  const hasAnimatedIn = useRef(false);

  useEffect(() => {
    // Only animate in once on first mount, then stay visible
    if (!hasAnimatedIn.current) {
      const timer = setTimeout(() => {
        setIsAnimated(true);
        hasAnimatedIn.current = true;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!targetRect) return null;

  const cutoutStyle: React.CSSProperties = {
    position: "absolute",
    top: targetRect.top - padding,
    left: targetRect.left - padding,
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
    borderRadius: "16px",
    boxShadow: `
      0 0 0 9999px rgba(0, 0, 0, 0.75),
      0 0 0 4px var(--accent),
      0 0 30px var(--accent)
    `,
    transform: isAnimated ? "scale(1)" : "scale(0.95)",
    opacity: isAnimated ? 1 : 0,
    // Use separate transitions for smoother mobile performance
    transition: "top 0.2s ease-out, left 0.2s ease-out, width 0.2s ease-out, height 0.2s ease-out, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-out",
    pointerEvents: "none",
    // GPU acceleration
    willChange: "transform, opacity",
  };

  return (
    <>
      {/* Full screen overlay - blocks clicks outside spotlight (unless allowInteraction) */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999,
          pointerEvents: allowInteraction ? "none" : "auto",
        }}
      />

      {/* Cutout highlight */}
      <div style={{ ...cutoutStyle, pointerEvents: "none" }}>
        {/* Pulsing ring animation */}
        <div
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "20px",
            border: "2px solid var(--accent)",
            opacity: 0.5,
            animation: "spotlightPulse 2s ease-in-out infinite",
          }}
        />
      </div>

      {/* Allow clicks on the highlighted element (when not in allowInteraction mode) */}
      {!allowInteraction && (
        <div
          style={{
            position: "fixed",
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            zIndex: 1000,
            pointerEvents: "auto",
            cursor: "pointer",
          }}
        />
      )}

      <style jsx>{`
        @keyframes spotlightPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.2;
          }
        }
      `}</style>
    </>
  );
}
