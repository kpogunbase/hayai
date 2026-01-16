"use client";

import { useEffect, useState } from "react";

interface OnboardingTooltipProps {
  title: string;
  description: string;
  keyboardHint?: string;
  position?: "top" | "bottom" | "left" | "right";
  targetRect?: DOMRect | null;
  showSuccess?: boolean;
  successMessage?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function OnboardingTooltip({
  title,
  description,
  keyboardHint,
  position = "bottom",
  targetRect,
  showSuccess,
  successMessage,
  onAction,
  actionLabel,
}: OnboardingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate position based on target rect
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) {
      // Center of screen if no target
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) ${isVisible ? "translateY(0)" : "translateY(20px)"}`,
      };
    }

    const padding = 16;
    const arrowSize = 8;

    const baseStyle: React.CSSProperties = {
      position: "fixed",
    };

    switch (position) {
      case "top":
        return {
          ...baseStyle,
          bottom: `calc(100vh - ${targetRect.top}px + ${padding + arrowSize}px)`,
          left: targetRect.left + targetRect.width / 2,
          transform: `translateX(-50%) ${isVisible ? "translateY(0)" : "translateY(10px)"}`,
        };
      case "bottom":
        return {
          ...baseStyle,
          top: targetRect.bottom + padding + arrowSize,
          left: targetRect.left + targetRect.width / 2,
          transform: `translateX(-50%) ${isVisible ? "translateY(0)" : "translateY(-10px)"}`,
        };
      case "left":
        return {
          ...baseStyle,
          right: `calc(100vw - ${targetRect.left}px + ${padding + arrowSize}px)`,
          top: targetRect.top + targetRect.height / 2,
          transform: `translateY(-50%) ${isVisible ? "translateX(0)" : "translateX(10px)"}`,
        };
      case "right":
        return {
          ...baseStyle,
          left: targetRect.right + padding + arrowSize,
          top: targetRect.top + targetRect.height / 2,
          transform: `translateY(-50%) ${isVisible ? "translateX(0)" : "translateX(-10px)"}`,
        };
      default:
        return baseStyle;
    }
  };

  const getArrowStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      width: 0,
      height: 0,
      borderStyle: "solid",
    };

    const arrowSize = 8;
    const color = showSuccess ? "var(--success-bg, #10b981)" : "var(--bg-primary)";

    switch (position) {
      case "top":
        return {
          ...baseStyle,
          bottom: -arrowSize,
          left: "50%",
          transform: "translateX(-50%)",
          borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
          borderColor: `${color} transparent transparent transparent`,
        };
      case "bottom":
        return {
          ...baseStyle,
          top: -arrowSize,
          left: "50%",
          transform: "translateX(-50%)",
          borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
          borderColor: `transparent transparent ${color} transparent`,
        };
      case "left":
        return {
          ...baseStyle,
          right: -arrowSize,
          top: "50%",
          transform: "translateY(-50%)",
          borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
          borderColor: `transparent transparent transparent ${color}`,
        };
      case "right":
        return {
          ...baseStyle,
          left: -arrowSize,
          top: "50%",
          transform: "translateY(-50%)",
          borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
          borderColor: `transparent ${color} transparent transparent`,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div
      style={{
        ...getTooltipStyle(),
        maxWidth: "320px",
        padding: "20px 24px",
        backgroundColor: showSuccess ? "var(--success-bg, #10b981)" : "var(--bg-primary)",
        borderRadius: "16px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        opacity: isVisible ? 1 : 0,
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        zIndex: 1001,
      }}
    >
      {/* Arrow */}
      {targetRect && <div style={getArrowStyle()} />}

      {/* Content */}
      {showSuccess ? (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#fff",
            }}
          >
            {successMessage}
          </span>
        </div>
      ) : (
        <>
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: "0 0 8px",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>

          {keyboardHint && (
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <kbd
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "32px",
                  height: "32px",
                  padding: "0 10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: "inherit",
                  color: "var(--text-primary)",
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px var(--shadow)",
                }}
              >
                {keyboardHint}
              </kbd>
              <span style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
                to continue
              </span>
            </div>
          )}

          {onAction && actionLabel && (
            <button
              onClick={onAction}
              style={{
                marginTop: "16px",
                width: "100%",
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
                backgroundColor: "var(--accent)",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "transform 0.15s, opacity 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {actionLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}
