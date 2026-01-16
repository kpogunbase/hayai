"use client";

import { useEffect, useState, useCallback } from "react";

export type CelebrationType = "complete" | "milestone" | "chapter";

interface CelebrationOverlayProps {
  type: CelebrationType;
  message?: string;
  onComplete?: () => void;
}

const celebrationConfig: Record<
  CelebrationType,
  { title: string; subtitle: string; duration: number }
> = {
  complete: {
    title: "Finished",
    subtitle: "You've completed this text",
    duration: 3000,
  },
  milestone: {
    title: "Milestone",
    subtitle: "Keep going, you're doing great",
    duration: 2500,
  },
  chapter: {
    title: "Chapter Complete",
    subtitle: "Ready for the next one",
    duration: 2500,
  },
};

export function CelebrationOverlay({
  type,
  message,
  onComplete,
}: CelebrationOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const config = celebrationConfig[type];

  useEffect(() => {
    // Enter phase
    const holdTimer = setTimeout(() => {
      setPhase("hold");
    }, 400);

    // Exit phase
    const exitTimer = setTimeout(() => {
      setPhase("exit");
    }, config.duration - 400);

    // Complete
    const completeTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, config.duration);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [config.duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 200,
      }}
    >
      {/* Radial burst rings */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "100px",
              height: "100px",
              marginLeft: "-50px",
              marginTop: "-50px",
              borderRadius: "50%",
              border: "1px solid var(--accent)",
              opacity: phase === "exit" ? 0 : 0.4 - i * 0.1,
              transform: `scale(${phase === "enter" ? 1 : 10 + i * 3})`,
              transition:
                phase === "enter"
                  ? "none"
                  : `transform ${1.5 + i * 0.3}s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease-out`,
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>

      {/* Center glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "300px",
          height: "300px",
          marginLeft: "-150px",
          marginTop: "-150px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
          opacity: phase === "exit" ? 0 : phase === "enter" ? 0 : 0.15,
          transform: `scale(${phase === "hold" ? 2 : 0})`,
          transition:
            "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease-out",
        }}
      />

      {/* Particle rays */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {[...Array(12)].map((_, i) => (
          <div
            key={`ray-${i}`}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "2px",
              height: phase === "enter" ? "0" : "120px",
              marginLeft: "-1px",
              background: `linear-gradient(to top, transparent, var(--accent))`,
              opacity: phase === "exit" ? 0 : 0.6,
              transform: `rotate(${i * 30}deg) translateY(${
                phase === "enter" ? 0 : -200
              }px)`,
              transformOrigin: "bottom center",
              transition: `height 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${
                i * 30
              }ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${
                i * 30
              }ms, opacity 0.3s ease-out`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          opacity: phase === "exit" ? 0 : phase === "enter" ? 0 : 1,
          transform: `scale(${phase === "hold" ? 1 : 0.8}) translateY(${
            phase === "hold" ? 0 : 20
          }px)`,
          transition:
            "opacity 0.3s ease-out, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          transitionDelay: phase === "hold" ? "0.2s" : "0s",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 40px var(--accent)",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Text */}
        <div
          style={{
            textAlign: "center",
            marginTop: "8px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: "0 0 4px",
              letterSpacing: "-0.02em",
            }}
          >
            {message || config.title}
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              margin: 0,
            }}
          >
            {config.subtitle}
          </p>
        </div>
      </div>

      {/* Floating particles */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const distance = 80 + Math.random() * 40;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;
          const delay = i * 50;

          return (
            <div
              key={`particle-${i}`}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "6px",
                height: "6px",
                marginLeft: "-3px",
                marginTop: "-3px",
                borderRadius: "50%",
                backgroundColor: "var(--accent)",
                opacity: phase === "exit" ? 0 : phase === "enter" ? 0 : 0.8,
                transform: `translate(${phase === "hold" ? x * 2 : 0}px, ${
                  phase === "hold" ? y * 2 : 0
                }px) scale(${phase === "hold" ? 1 : 0})`,
                transition: `transform 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, opacity 0.3s ease-out`,
                boxShadow: "0 0 10px var(--accent)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// Hook for triggering celebrations
export function useCelebration() {
  const [celebration, setCelebration] = useState<{
    type: CelebrationType;
    message?: string;
  } | null>(null);

  const celebrate = useCallback((type: CelebrationType, message?: string) => {
    setCelebration({ type, message });
  }, []);

  const clear = useCallback(() => {
    setCelebration(null);
  }, []);

  return { celebration, celebrate, clear };
}
