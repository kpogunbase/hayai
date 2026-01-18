"use client";

import { useEffect, useState, useCallback } from "react";
import { useOnboardingStore, OnboardingStep } from "@/lib/stores/onboardingStore";
import { OnboardingSpotlight } from "./OnboardingSpotlight";
import { OnboardingTooltip } from "./OnboardingTooltip";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

// Demo text for onboarding
const DEMO_TEXT = `Speed reading is a powerful skill that can transform how you consume information. By training your eyes and brain to process words more efficiently, you can dramatically increase your reading speed while maintaining comprehension.

The key principles of speed reading include minimizing subvocalization, expanding your peripheral vision, and using techniques like chunking to group words together. With practice, many readers can double or even triple their reading speed.

This app uses RSVP (Rapid Serial Visual Presentation) to display one word at a time at your chosen speed. The highlighted letter in each word is the Optimal Recognition Point, which helps your brain process words faster.

Start with a comfortable speed around 300-400 words per minute, then gradually increase as you build confidence. Challenge mode will automatically ramp up your speed over time, pushing you to read faster than you thought possible.

Happy reading!`;

interface StepConfig {
  title: string;
  description: string;
  keyboardHint?: string;
  actionLabel?: string;
  targetSelector?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  // Mobile-specific properties
  mobileDescription?: string;
  mobileActionLabel?: string;
  mobileTargetSelector?: string;
}

const STEP_CONFIGS: Record<OnboardingStep, StepConfig> = {
  welcome: {
    title: "Welcome to Hayai",
    description: "Learn to speed read in under 60 seconds. Let's get started!",
    actionLabel: "Let's go",
  },
  upload: {
    title: "Load your text",
    description: "Drop a file to read, or try our demo text to see how it works.",
    actionLabel: "Use demo text",
    targetSelector: "[data-onboarding='upload']",
    tooltipPosition: "bottom",
  },
  play: {
    title: "Start reading",
    description: "Press Space to start and pause your reading session.",
    keyboardHint: "Space",
    targetSelector: "[data-onboarding='rsvp-display']",
    tooltipPosition: "bottom",
    // Mobile: tap the play button
    mobileDescription: "Tap the play button to start and pause your reading session.",
    mobileActionLabel: "Tap play button below",
    mobileTargetSelector: "[data-onboarding='reader-controls']",
  },
  navigate: {
    title: "Navigate through text",
    description: "Use arrow keys to skip forward or back through the text.",
    keyboardHint: "← →",
    targetSelector: "[data-onboarding='rsvp-display']",
    tooltipPosition: "bottom",
    // Mobile: use the arrow buttons
    mobileDescription: "Use the arrow buttons to skip forward or back through the text.",
    mobileActionLabel: "Try the arrow buttons",
    mobileTargetSelector: "[data-onboarding='reader-controls']",
  },
  speed: {
    title: "Adjust your speed",
    description: "Drag the slider to find your comfortable reading speed. Start slow and build up!",
    actionLabel: "Got it",
    targetSelector: "[data-onboarding='wpm-slider']",
    tooltipPosition: "top",
  },
  shortcuts: {
    title: "Discover more",
    description: "Press ? anytime to see all available keyboard shortcuts.",
    keyboardHint: "?",
    targetSelector: "[data-onboarding='rsvp-display']",
    tooltipPosition: "bottom",
    // Mobile: show action button to view controls
    mobileDescription: "There are more controls and features to discover as you read.",
    mobileActionLabel: "View all controls",
  },
  complete: {
    title: "You're all set!",
    description: "You've learned the basics. Discover more features as you read.",
    actionLabel: "Start reading",
  },
};

interface OnboardingOverlayProps {
  onLoadDemoText?: (text: string) => void;
}

export function OnboardingOverlay({ onLoadDemoText }: OnboardingOverlayProps) {
  const {
    isActive,
    currentStep,
    showStepCelebration,
    celebrationMessage,
    nextStep,
    skipOnboarding,
    completeOnboarding,
    reportAction,
  } = useOnboardingStore();

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();

  // Fade in on mount
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isActive]);

  // Update target rect when step changes
  useEffect(() => {
    if (!isActive) return;

    const config = STEP_CONFIGS[currentStep];

    // Special case: during shortcuts step celebration, target the modal instead
    let selector: string | undefined;
    if (currentStep === "shortcuts" && showStepCelebration) {
      selector = "[data-onboarding='shortcuts-modal']";
    } else {
      // Use mobile-specific selector if on mobile and one exists
      selector = isMobile && config.mobileTargetSelector
        ? config.mobileTargetSelector
        : config.targetSelector;
    }

    if (selector) {
      const updateRect = () => {
        const element = document.querySelector(selector!);
        if (element) {
          setTargetRect(element.getBoundingClientRect());
        } else {
          setTargetRect(null);
        }
      };

      // Initial update
      updateRect();

      // Update on resize/scroll
      window.addEventListener("resize", updateRect);
      window.addEventListener("scroll", updateRect);

      return () => {
        window.removeEventListener("resize", updateRect);
        window.removeEventListener("scroll", updateRect);
      };
    } else {
      setTargetRect(null);
    }
  }, [isActive, currentStep, isMobile, showStepCelebration]);

  // Handle keyboard shortcuts during onboarding
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip on Escape
      if (e.key === "Escape") {
        e.preventDefault();
        skipOnboarding();
        return;
      }

      // Welcome step - Space or Enter to continue
      if (currentStep === "welcome") {
        if (e.code === "Space" || e.code === "Enter") {
          e.preventDefault();
          nextStep();
        }
        return;
      }

      // Complete step - Enter to finish
      if (currentStep === "complete") {
        if (e.code === "Enter" || e.code === "Space") {
          e.preventDefault();
          completeOnboarding();
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isActive, currentStep, nextStep, skipOnboarding, completeOnboarding]);

  // Handle action button clicks
  const handleAction = useCallback(() => {
    switch (currentStep) {
      case "welcome":
        nextStep();
        break;
      case "upload":
        // Load demo text and advance
        if (onLoadDemoText) {
          onLoadDemoText(DEMO_TEXT);
        }
        reportAction("upload");
        break;
      case "speed":
        nextStep();
        break;
      case "shortcuts":
        // On mobile, the action button advances the step directly
        if (isMobile) {
          reportAction("help");
        }
        break;
      case "complete":
        completeOnboarding();
        break;
      default:
        nextStep();
    }
  }, [currentStep, nextStep, completeOnboarding, onLoadDemoText, reportAction, isMobile]);

  if (!isActive) return null;

  const config = STEP_CONFIGS[currentStep];
  const isFullScreen = currentStep === "welcome" || currentStep === "complete";
  const stepIndex = Object.keys(STEP_CONFIGS).indexOf(currentStep);
  const totalSteps = Object.keys(STEP_CONFIGS).length;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 998,
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      {/* Background overlay for full-screen steps */}
      {isFullScreen && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
          }}
        />
      )}

      {/* Dimmed background for success celebration states (except shortcuts which has its own spotlight) */}
      {!isFullScreen && showStepCelebration && currentStep !== "shortcuts" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            transition: "opacity 0.3s ease",
            zIndex: 999,
          }}
        />
      )}

      {/* Spotlight for targeted steps (show during shortcuts celebration to highlight modal) */}
      {!isFullScreen && targetRect && (!showStepCelebration || currentStep === "shortcuts") && (
        <OnboardingSpotlight
          targetRect={targetRect}
          allowInteraction={currentStep === "speed"}
        />
      )}

      {/* Full-screen welcome/complete content */}
      {isFullScreen && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              width: isMobile ? "64px" : "80px",
              height: isMobile ? "64px" : "80px",
              borderRadius: isMobile ? "16px" : "20px",
              background: "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: isMobile ? "24px" : "32px",
              boxShadow: "0 0 60px var(--accent)",
            }}
          >
            {currentStep === "complete" ? (
              <svg
                width={isMobile ? "32" : "40"}
                height={isMobile ? "32" : "40"}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width={isMobile ? "32" : "40"}
                height={isMobile ? "32" : "40"}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            )}
          </div>

          {/* Title */}
          {currentStep === "welcome" ? (
            <div style={{ textAlign: "center", marginBottom: "12px" }}>
              <p
                style={{
                  fontSize: isMobile ? "14px" : "16px",
                  fontWeight: 400,
                  color: "var(--text-secondary)",
                  margin: "0 0 8px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Welcome to
              </p>
              <h1
                style={{
                  fontSize: isMobile ? "32px" : "42px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  margin: 0,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                }}
              >
                Hayai
              </h1>
            </div>
          ) : (
            <h1
              style={{
                fontSize: isMobile ? "24px" : "32px",
                fontWeight: 700,
                color: "var(--text-primary)",
                margin: "0 0 12px",
                textAlign: "center",
              }}
            >
              {config.title}
            </h1>
          )}

          {/* Description */}
          {currentStep === "welcome" ? (
            <div
              style={{
                textAlign: "center",
                margin: isMobile ? "0 0 24px" : "0 0 32px",
                maxWidth: "400px",
                padding: isMobile ? "0 16px" : "0",
              }}
            >
              <p
                style={{
                  fontSize: isMobile ? "14px" : "16px",
                  color: "var(--text-secondary)",
                  margin: "0 0 8px",
                  lineHeight: 1.6,
                }}
              >
                Learn to speed read in under 60 seconds.
              </p>
              <p
                style={{
                  fontSize: isMobile ? "15px" : "17px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                Let's get started!
              </p>
            </div>
          ) : (
            <p
              style={{
                fontSize: isMobile ? "14px" : "16px",
                color: "var(--text-secondary)",
                margin: isMobile ? "0 0 24px" : "0 0 32px",
                textAlign: "center",
                maxWidth: "400px",
                lineHeight: 1.6,
                padding: isMobile ? "0 16px" : "0",
              }}
            >
              {config.description}
            </p>
          )}

          {/* Additional hints for complete step - hide on mobile */}
          {currentStep === "complete" && !isMobile && (
            <div
              style={{
                display: "flex",
                gap: "16px",
                marginBottom: "32px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {[
                { key: "S", label: "Side panel" },
                { key: "B", label: "Bookmarks" },
                { key: "H", label: "Highlights" },
                { key: "L", label: "Library" },
              ].map((hint) => (
                <div
                  key={hint.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <kbd
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "24px",
                      height: "24px",
                      fontSize: "12px",
                      fontWeight: 600,
                      fontFamily: "inherit",
                      color: "var(--text-primary)",
                      backgroundColor: "var(--bg-tertiary)",
                      borderRadius: "4px",
                    }}
                  >
                    {hint.key}
                  </kbd>
                  <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    {hint.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleAction}
            style={{
              padding: isMobile ? "14px 36px" : "16px 48px",
              fontSize: isMobile ? "15px" : "16px",
              fontWeight: 600,
              color: "#fff",
              background: "var(--accent-gradient)",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "transform 0.15s, box-shadow 0.15s, opacity 0.15s",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(0, 0, 0, 0.3)";
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.2)";
              e.currentTarget.style.opacity = "1";
            }}
          >
            {config.actionLabel}
          </button>

          {/* Skip button (welcome only) */}
          {currentStep === "welcome" && (
            <button
              onClick={skipOnboarding}
              style={{
                marginTop: "16px",
                padding: "8px 16px",
                fontSize: "14px",
                color: "var(--text-tertiary)",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-tertiary)";
              }}
            >
              Skip tutorial
            </button>
          )}

          {/* Keyboard hint - hide on mobile */}
          {!isMobile && (
            <p
              style={{
                position: "absolute",
                bottom: "32px",
                fontSize: "13px",
                color: "var(--text-tertiary)",
              }}
            >
              Press <kbd style={kbdStyle}>{currentStep === "welcome" ? "Space" : "Enter"}</kbd> to continue
              {currentStep === "welcome" && (
                <> or <kbd style={kbdStyle}>Esc</kbd> to skip</>
              )}
            </p>
          )}
        </div>
      )}

      {/* Tooltip for targeted steps */}
      {!isFullScreen && (
        <OnboardingTooltip
          title={config.title}
          description={isMobile && config.mobileDescription ? config.mobileDescription : config.description}
          keyboardHint={isMobile ? undefined : config.keyboardHint}
          position={config.tooltipPosition}
          targetRect={targetRect}
          showSuccess={showStepCelebration}
          successMessage={celebrationMessage}
          onAction={(config.actionLabel || (isMobile && config.mobileActionLabel)) ? handleAction : undefined}
          actionLabel={isMobile && config.mobileActionLabel ? config.mobileActionLabel : config.actionLabel}
          isMobile={isMobile}
        />
      )}

      {/* Progress indicator */}
      <div
        style={{
          position: "fixed",
          bottom: isMobile ? "24px" : "80px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
          zIndex: 1002,
        }}
      >
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === stepIndex ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              backgroundColor:
                i < stepIndex
                  ? "var(--accent)"
                  : i === stepIndex
                  ? "var(--accent)"
                  : "var(--bg-tertiary)",
              opacity: i <= stepIndex ? 1 : 0.5,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

const kbdStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 8px",
  fontSize: "12px",
  fontFamily: "inherit",
  backgroundColor: "var(--bg-tertiary)",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  margin: "0 4px",
};

// Export demo text for external use
export { DEMO_TEXT };
