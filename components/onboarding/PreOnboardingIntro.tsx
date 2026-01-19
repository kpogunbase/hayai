"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RsvpWord } from "@/components/RsvpWord";

// Audio configuration
const FOCUS_TRACK_SRC = "/audio/focus-2.mp3";
const FADE_DURATION = 1500; // 1.5 seconds fade out

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
  const [currentWord, setCurrentWord] = useState("");
  const [currentWpm, setCurrentWpm] = useState(INTRO_SEGMENTS[0].wpm);
  const [isVisible, setIsVisible] = useState(true);
  const [showSkip, setShowSkip] = useState(false);
  const [progress, setProgress] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isCompletedRef = useRef(false);
  const totalDuration = 30000;

  // Fade out audio then call onComplete
  const fadeOutAndComplete = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const audio = audioRef.current;
    if (audio && audio.volume > 0) {
      const startVolume = audio.volume;
      const steps = 30;
      const stepDuration = FADE_DURATION / steps;
      const volumeStep = startVolume / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        const newVolume = Math.max(0, startVolume - volumeStep * currentStep);
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

  // Main playback loop - runs once on mount
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

    // Show skip button after 2 seconds
    const skipTimer = setTimeout(() => setShowSkip(true), 2000);
    startTimeRef.current = Date.now();

    // Build flat list of all words with their timing
    interface WordItem {
      word: string;
      wpm: number;
      pauseAfter: number;
      isLastInSegment: boolean;
    }

    const allWords: WordItem[] = [];
    for (const segment of INTRO_SEGMENTS) {
      const words = tokenize(segment.text);
      words.forEach((word, i) => {
        allWords.push({
          word,
          wpm: segment.wpm,
          pauseAfter: i === words.length - 1 ? segment.pauseAfter : 0,
          isLastInSegment: i === words.length - 1,
        });
      });
    }

    // Start with first word immediately
    if (allWords.length > 0) {
      setCurrentWord(allWords[0].word);
      setCurrentWpm(allWords[0].wpm);
    }

    // Schedule all subsequent words
    let wordIndex = 0;

    const scheduleNextWord = () => {
      if (isCompletedRef.current) return;

      const current = allWords[wordIndex];
      const interval = getInterval(current.wpm);
      const totalDelay = interval + current.pauseAfter;

      timeoutRef.current = setTimeout(() => {
        wordIndex++;

        if (wordIndex >= allWords.length) {
          // All done
          fadeOutAndComplete();
          return;
        }

        const next = allWords[wordIndex];
        setCurrentWord(next.word);
        setCurrentWpm(next.wpm);
        scheduleNextWord();
      }, totalDelay);
    };

    // Start the scheduler after displaying first word
    scheduleNextWord();

    return () => {
      clearTimeout(skipTimer);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [fadeOutAndComplete]);

  // Update progress bar
  useEffect(() => {
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min((elapsed / totalDuration) * 100, 100));
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

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
        {currentWpm} WPM
      </div>

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
