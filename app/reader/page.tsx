"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RsvpWord } from "@/components/RsvpWord";
import { ReaderControls } from "@/components/ReaderControls";
import { WpmSlider } from "@/components/WpmSlider";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ModeSelector, ReaderMode } from "@/components/ModeSelector";
import { useAudio } from "@/lib/useAudio";
import { intervalForToken } from "@/lib/reader/timing";
import {
  getChallengeWpm,
  ChallengeDuration,
  CHALLENGE_DURATIONS,
  DEFAULT_CHALLENGE_CONFIG,
} from "@/lib/reader/ramp";

const DEFAULT_WPM = 400;

export default function ReaderPage() {
  const router = useRouter();

  // Reader state
  const [tokens, setTokens] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Mode state
  const [mode, setMode] = useState<ReaderMode>("reading");
  const [challengeDuration, setChallengeDuration] = useState<ChallengeDuration>("3min");
  const [challengeStartTime, setChallengeStartTime] = useState<number | null>(null);
  const [currentChallengeWpm, setCurrentChallengeWpm] = useState(DEFAULT_CHALLENGE_CONFIG.startWpm);

  // Audio hook
  const audio = useAudio();

  // Timeout ref - single source of truth for the scheduler
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store current values in refs for use in scheduler callback
  const indexRef = useRef(index);
  const wpmRef = useRef(wpm);
  const tokensRef = useRef(tokens);
  const isPlayingRef = useRef(isPlaying);
  const modeRef = useRef(mode);
  const challengeStartTimeRef = useRef(challengeStartTime);
  const challengeDurationRef = useRef(challengeDuration);

  // Keep refs in sync with state
  useEffect(() => { indexRef.current = index; }, [index]);
  useEffect(() => { wpmRef.current = wpm; }, [wpm]);
  useEffect(() => { tokensRef.current = tokens; }, [tokens]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { challengeStartTimeRef.current = challengeStartTime; }, [challengeStartTime]);
  useEffect(() => { challengeDurationRef.current = challengeDuration; }, [challengeDuration]);

  // Load tokens from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("hayai_tokens");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTokens(parsed);
          setIsLoaded(true);
          return;
        }
      } catch {
        // Invalid JSON, redirect
      }
    }
    router.push("/");
  }, [router]);

  // Get effective WPM based on mode
  const getEffectiveWpm = useCallback(() => {
    if (modeRef.current === "reading") {
      return wpmRef.current;
    }
    // Challenge mode
    const startTime = challengeStartTimeRef.current;
    if (!startTime) return DEFAULT_CHALLENGE_CONFIG.startWpm;

    const elapsed = Date.now() - startTime;
    const config = {
      ...DEFAULT_CHALLENGE_CONFIG,
      durationMs: CHALLENGE_DURATIONS[challengeDurationRef.current],
    };
    return getChallengeWpm(elapsed, config);
  }, []);

  /**
   * Schedule the next token advancement.
   *
   * SCHEDULER PATTERN:
   * - Uses a single setTimeout per tick (never setInterval)
   * - Each tick computes interval based on current WPM
   * - Advances index and schedules next tick
   * - Stops when reaching end of tokens or when paused
   */
  const scheduleNextTick = useCallback(() => {
    // Clear any existing timeout first (safety)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Check if we should continue playing
    if (!isPlayingRef.current) {
      return;
    }

    const currentTokens = tokensRef.current;
    const currentIndex = indexRef.current;

    // Stop at end of tokens
    if (currentIndex >= currentTokens.length - 1) {
      setIsPlaying(false);
      return;
    }

    // Get effective WPM (reading mode uses slider, challenge uses ramp)
    const effectiveWpm = getEffectiveWpm();

    // Update displayed challenge WPM
    if (modeRef.current === "challenge") {
      setCurrentChallengeWpm(effectiveWpm);
    }

    // Calculate interval for current token
    const currentToken = currentTokens[currentIndex];
    const interval = intervalForToken(currentToken, effectiveWpm);

    // Schedule next tick
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => prev + 1);
      scheduleNextTick();
    }, interval);
  }, [getEffectiveWpm]);

  // Handle play/pause - syncs with audio
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      // PAUSE: Clear timeout immediately and pause audio
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsPlaying(false);
      audio.pause();
    } else {
      // PLAY: Start scheduler and audio
      if (index >= tokens.length - 1) {
        setIndex(0);
        // Reset challenge timer on restart
        if (mode === "challenge") {
          setChallengeStartTime(Date.now());
        }
      }
      // Start challenge timer if not already started
      if (mode === "challenge" && !challengeStartTime) {
        setChallengeStartTime(Date.now());
      }
      setIsPlaying(true);
      audio.play();
    }
  }, [isPlaying, index, tokens.length, audio, mode, challengeStartTime]);

  // Start scheduler when isPlaying becomes true
  useEffect(() => {
    if (isPlaying && tokens.length > 0) {
      scheduleNextTick();
    }
  }, [isPlaying, scheduleNextTick, tokens.length]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle restart
  const handleRestart = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPlaying(false);
    setIndex(0);
    setChallengeStartTime(null);
    setCurrentChallengeWpm(DEFAULT_CHALLENGE_CONFIG.startWpm);
    audio.pause();
  }, [audio]);

  // Handle back 10
  const handleBack = useCallback(() => {
    setIndex((prev) => Math.max(0, prev - 10));
  }, []);

  // Handle forward 10
  const handleForward = useCallback(() => {
    setIndex((prev) => Math.min(tokens.length - 1, prev + 10));
  }, [tokens.length]);

  // Handle WPM change
  const handleWpmChange = useCallback((newWpm: number) => {
    setWpm(newWpm);
  }, []);

  // Handle mode change
  const handleModeChange = useCallback((newMode: ReaderMode) => {
    setMode(newMode);
    // Reset challenge state when switching modes
    if (newMode === "challenge") {
      setChallengeStartTime(null);
      setCurrentChallengeWpm(DEFAULT_CHALLENGE_CONFIG.startWpm);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          handlePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleBack();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleForward();
          break;
        case "KeyR":
          e.preventDefault();
          handleRestart();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePlayPause, handleBack, handleForward, handleRestart]);

  // Loading state
  if (!isLoaded) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            border: "3px solid var(--border)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    );
  }

  const currentToken = tokens[index] || "";
  const displayWpm = mode === "challenge" ? currentChallengeWpm : wpm;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <button
          onClick={() => router.push("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--text-secondary)",
            backgroundColor: "transparent",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          New file
        </button>

        <ThemeToggle />
      </header>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          gap: "32px",
        }}
      >
        {/* Current WPM display (especially useful for challenge mode) */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: mode === "challenge" ? "var(--accent)" : "var(--text-tertiary)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {displayWpm} WPM
          {mode === "challenge" && (
            <span style={{ fontWeight: 400, marginLeft: "8px", color: "var(--text-tertiary)" }}>
              (Challenge)
            </span>
          )}
        </div>

        {/* RSVP display area */}
        <div
          style={{
            width: "100%",
            maxWidth: "700px",
            minHeight: "140px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "16px",
            border: "1px solid var(--border)",
          }}
        >
          <RsvpWord token={currentToken} />
        </div>

        {/* Controls */}
        <ReaderControls
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onRestart={handleRestart}
          onBack={handleBack}
          onForward={handleForward}
          currentIndex={index}
          totalTokens={tokens.length}
        />

        {/* Mode selector */}
        <div style={{ width: "100%", maxWidth: "280px" }}>
          <ModeSelector
            mode={mode}
            challengeDuration={challengeDuration}
            onModeChange={handleModeChange}
            onDurationChange={setChallengeDuration}
            disabled={isPlaying}
          />
        </div>

        {/* WPM Slider (only in reading mode) */}
        {mode === "reading" && (
          <div style={{ width: "100%", maxWidth: "320px" }}>
            <WpmSlider wpm={wpm} onChange={handleWpmChange} />
          </div>
        )}

        {/* Audio Player */}
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <AudioPlayer
            currentTrack={audio.currentTrack}
            volume={audio.volume}
            isMuted={audio.isMuted}
            onVolumeChange={audio.setVolume}
            onToggleMute={audio.toggleMute}
            onNextTrack={audio.nextTrack}
          />
        </div>

        {/* Keyboard shortcuts hint */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            fontSize: "12px",
            color: "var(--text-tertiary)",
          }}
        >
          <span><kbd style={kbdStyle}>Space</kbd> Play/Pause</span>
          <span><kbd style={kbdStyle}>←</kbd><kbd style={kbdStyle}>→</kbd> Skip</span>
          <span><kbd style={kbdStyle}>R</kbd> Restart</span>
        </div>
      </div>
    </main>
  );
}

const kbdStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 6px",
  fontSize: "11px",
  fontFamily: "inherit",
  backgroundColor: "var(--bg-tertiary)",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  marginRight: "4px",
};
