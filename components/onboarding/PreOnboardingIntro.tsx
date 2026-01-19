"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RsvpWord } from "@/components/RsvpWord";

// Intro script - designed to be read at increasing speeds
const INTRO_SEGMENTS = [
  {
    text: "Ever wanted to read faster?",
    wpm: 200,
    pauseAfter: 800,
  },
  {
    text: "What if you could double your reading speed?",
    wpm: 250,
    pauseAfter: 600,
  },
  {
    text: "Or even triple it?",
    wpm: 300,
    pauseAfter: 800,
  },
  {
    text: "Introducing Rapid Serial Visual Presentation.",
    wpm: 280,
    pauseAfter: 500,
  },
  {
    text: "RSVP displays one word at a time at your chosen speed.",
    wpm: 320,
    pauseAfter: 400,
  },
  {
    text: "Your eyes stay fixed. No scanning. No backtracking.",
    wpm: 350,
    pauseAfter: 400,
  },
  {
    text: "Just pure, focused reading.",
    wpm: 300,
    pauseAfter: 600,
  },
  {
    text: "The average person reads 200 to 250 words per minute.",
    wpm: 350,
    pauseAfter: 300,
  },
  {
    text: "With practice, you can reach 500, 600, even 900 words per minute.",
    wpm: 400,
    pauseAfter: 400,
  },
  {
    text: "This is Hayai.",
    wpm: 250,
    pauseAfter: 500,
  },
  {
    text: "Fast in Japanese.",
    wpm: 280,
    pauseAfter: 600,
  },
  {
    text: "Let's begin.",
    wpm: 200,
    pauseAfter: 1000,
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
  const [isVisible, setIsVisible] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [progress, setProgress] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const totalDuration = 30000; // 30 seconds total

  // Calculate all tokens for current segment
  const currentSegment = INTRO_SEGMENTS[currentSegmentIndex];
  const tokens = currentSegment ? tokenize(currentSegment.text) : [];

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    const skipTimer = setTimeout(() => setShowSkip(true), 3000);
    startTimeRef.current = Date.now();

    return () => {
      clearTimeout(timer);
      clearTimeout(skipTimer);
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

  // Schedule next word/segment
  const scheduleNext = useCallback(() => {
    if (!currentSegment) {
      onComplete();
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
            // All segments complete
            onComplete();
          }
        }, currentSegment.pauseAfter);
      }
    }, interval);
  }, [currentSegment, currentWordIndex, tokens, currentSegmentIndex, onComplete]);

  // Start the sequence
  useEffect(() => {
    if (tokens.length > 0 && currentWord === "") {
      setCurrentWord(tokens[0]);
    }
  }, [tokens, currentWord]);

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

  // Handle skip
  const handleSkip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onComplete();
  }, [onComplete]);

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
