"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RsvpWord } from "@/components/RsvpWord";

// Audio configuration
const FOCUS_TRACK_SRC = "/audio/focus-2.mp3";
const FADE_DURATION = 500; // 0.5 seconds fade out

// Intro script - short and punchy (~5 seconds total)
const INTRO_SEGMENTS = [
  {
    text: "Read faster.",
    wpm: 300,
    pauseAfter: 300,
  },
  {
    text: "One word at a time.",
    wpm: 400,
    pauseAfter: 200,
  },
  {
    text: "This is Hayai.",
    wpm: 350,
    pauseAfter: 300,
  },
  {
    text: "Let's begin.",
    wpm: 300,
    pauseAfter: 400,
  },
];

// Tokenize text into words
function tokenize(text: string): string[] {
  return text.split(/\s+/).filter((word) => word.length > 0);
}

// Calculate interval for a word based on WPM
function getInterval(wpm: number): number {
  return Math.round(60000 / wpm);
}

interface PreOnboardingIntroProps {
  onComplete: () => void;
}

export function PreOnboardingIntro({ onComplete }: PreOnboardingIntroProps) {
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [isVisible, setIsVisible] = useState(true); // Start visible immediately
  const [showSkip, setShowSkip] = useState(false);
  const [progress, setProgress] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const totalDuration = 5000; // ~5 seconds total

  // Calculate all tokens for current segment
  const currentSegment = INTRO_SEGMENTS[currentSegmentIndex];
  const tokens = currentSegment ? tokenize(currentSegment.text) : [];

  // Initialize audio and start immediately
  useEffect(() => {
    // Create and configure audio element
    const audio = new Audio(FOCUS_TRACK_SRC);
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;

    // Start playing immediately
    audio.play().catch(() => {
      // Audio autoplay might be blocked - that's okay
    });

    // Show skip button after 1 second
    const skipTimer = setTimeout(() => setShowSkip(true), 1000);
    startTimeRef.current = Date.now();

    // Start the first word immediately
    const firstTokens = tokenize(INTRO_SEGMENTS[0].text);
    if (firstTokens.length > 0) {
      setCurrentWord(firstTokens[0]);
    }

    return () => {
      clearTimeout(skipTimer);
      // Clean up audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Update progress bar
  useEffect(() => {
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min((elapsed / totalDuration) * 100, 100));
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

  // Fade out audio then call onComplete
  const fadeOutAndComplete = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const audio = audioRef.current;
    if (audio && audio.volume > 0) {
      // Fade out audio over FADE_DURATION
      const startVolume = audio.volume;
      const steps = 30;
      const stepDuration = FADE_DURATION / steps;
      const volumeStep = startVolume / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        const newVolume = Math.max(0, startVolume - (volumeStep * currentStep));
        audio.volume = newVolume;

        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          audio.pause();
          onComplete();
        }
      }, stepDuration);
    } else {
      onComplete();
    }
  }, [onComplete]);

  // Handle skip
  const handleSkip = useCallback(() => {
    fadeOutAndComplete();
  }, [fadeOutAndComplete]);

  // Schedule next word/segment
  const scheduleNext = useCallback(() => {
    if (!currentSegment) {
      fadeOutAndComplete();
      return;
    }

    const interval = getInterval(currentSegment.wpm);

    timeoutRef.current = setTimeout(() => {
      if (currentWordIndex < tokens.length - 1) {
        // Next word in segment
        setCurrentWordIndex((prev) => prev + 1);
        setCurrentWord(tokens[currentWordIndex + 1]);
        scheduleNext();
      } else {
        // End of segment - pause then move to next
        setTimeout(() => {
          if (currentSegmentIndex < INTRO_SEGMENTS.length - 1) {
            setCurrentSegmentIndex((prev) => prev + 1);
            setCurrentWordIndex(0);
            const nextTokens = tokenize(INTRO_SEGMENTS[currentSegmentIndex + 1].text);
            setCurrentWord(nextTokens[0] || "");
          } else {
            // All segments complete - fade out audio and transition
            fadeOutAndComplete();
          }
        }, currentSegment.pauseAfter);
      }
    }, interval);
  }, [currentSegment, currentWordIndex, tokens, currentSegmentIndex, fadeOutAndComplete]);

  // Schedule next word when word changes
  useEffect(() => {
    if (currentWord) {
      scheduleNext();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentWord, scheduleNext]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.code === "Space") {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            backgroundColor: "var(--accent, #6366f1)",
            transition: "width 0.1s linear",
          }}
        />
      </div>

      {/* RSVP display area */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "120px",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            fontSize: "clamp(32px, 8vw, 56px)",
            fontWeight: 500,
            color: "#fff",
            fontFamily: "inherit",
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          <RsvpWord token={currentWord} />
        </div>
      </div>

      {/* Current WPM indicator */}
      {currentSegment && (
        <div
          style={{
            position: "absolute",
            bottom: "100px",
            fontSize: "14px",
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.4)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {currentSegment.wpm} WPM
        </div>
      )}

      {/* Skip button */}
      {showSkip && (
        <button
          onClick={handleSkip}
          style={{
            position: "absolute",
            bottom: "40px",
            padding: "10px 24px",
            fontSize: "14px",
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.5)",
            backgroundColor: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            opacity: isVisible ? 1 : 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.9)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
          }}
        >
          Skip intro
          <span style={{ marginLeft: "8px", opacity: 0.6 }}>↵</span>
        </button>
      )}
    </div>
  );
}
