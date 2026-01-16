"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RsvpWord } from "@/components/RsvpWord";
import { ReaderControls } from "@/components/ReaderControls";
import { WpmSlider } from "@/components/WpmSlider";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ModeSelector, ReaderMode } from "@/components/ModeSelector";
import { SidePanel } from "@/components/sidepanel/SidePanel";
import { LibraryPanel } from "@/components/library/LibraryPanel";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { CelebrationOverlay, useCelebration } from "@/components/CelebrationOverlay";
import { OnboardingOverlay } from "@/components/onboarding/OnboardingOverlay";
import { useAudio } from "@/lib/useAudio";
import { intervalForToken } from "@/lib/reader/timing";
import { useReaderStore } from "@/lib/stores/readerStore";
import { useLibraryStore } from "@/lib/stores/libraryStore";
import { useStatsStore } from "@/lib/stores/statsStore";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { tokenize } from "@/lib/tokenize";
import {
  getChallengeWpm,
  ChallengeDuration,
  CHALLENGE_DURATIONS,
  DEFAULT_CHALLENGE_CONFIG,
} from "@/lib/reader/ramp";

const DEFAULT_WPM = 400;

export default function ReaderPage() {
  const router = useRouter();

  // Zustand stores
  const readerStore = useReaderStore();
  const libraryStore = useLibraryStore();
  const statsStore = useStatsStore();
  const onboardingActive = useOnboardingStore((s) => s.isActive);
  const reportOnboardingAction = useOnboardingStore((s) => s.reportAction);
  const isMobile = useIsMobile();

  // Local reader state (we'll sync with store as needed)
  const [tokens, setTokens] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");

  // UI state
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Celebration hook
  const { celebration, celebrate, clear: clearCelebration } = useCelebration();

  // Highlighting state
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [highlightStartIndex, setHighlightStartIndex] = useState<number | null>(null);

  // Mode state
  const [mode, setMode] = useState<ReaderMode>("reading");
  const [challengeDuration, setChallengeDuration] = useState<ChallengeDuration>("3min");
  const [challengeStartTime, setChallengeStartTime] = useState<number | null>(null);
  const [currentChallengeWpm, setCurrentChallengeWpm] = useState(DEFAULT_CHALLENGE_CONFIG.startWpm);

  // Session tracking
  const sessionStartRef = useRef<number | null>(null);
  const sessionStartIndexRef = useRef<number>(0);

  // Chapter milestone tracking
  const lastCelebratedChapterRef = useRef<number>(-1);

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

  // Helper to detect chapter markers (for EPUB/long texts)
  const isChapterMarker = useCallback((tokenIndex: number, tokenArray: string[]): boolean => {
    if (tokenIndex < 0 || tokenIndex >= tokenArray.length) return false;
    const token = tokenArray[tokenIndex].toLowerCase();
    // Detect patterns like "--- Chapter ---" or "Chapter 1" or "CHAPTER"
    if (token === "---" && tokenIndex + 1 < tokenArray.length) {
      const nextToken = tokenArray[tokenIndex + 1].toLowerCase();
      if (nextToken === "chapter" || nextToken.startsWith("chapter")) {
        return true;
      }
    }
    // Direct chapter heading
    if ((token === "chapter" || token.startsWith("chapter")) && tokenIndex > 0) {
      const prevToken = tokenArray[tokenIndex - 1];
      if (prevToken === "---") return true;
    }
    return false;
  }, []);

  // Load tokens from store or sessionStorage on mount
  useEffect(() => {
    // First check Zustand store
    const storeTokens = readerStore.tokens;
    const storeDocId = readerStore.documentId;
    const storeRawText = readerStore.rawText;

    if (storeTokens.length > 0) {
      setTokens(storeTokens);
      setDocumentId(storeDocId);
      setRawText(storeRawText);
      setIsLoaded(true);
      return;
    }

    // Fall back to sessionStorage
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
  }, [router, readerStore.tokens, readerStore.documentId, readerStore.rawText]);

  // Get effective WPM based on mode
  const getEffectiveWpm = useCallback(() => {
    if (modeRef.current === "reading") {
      return wpmRef.current;
    }
    const startTime = challengeStartTimeRef.current;
    if (!startTime) return DEFAULT_CHALLENGE_CONFIG.startWpm;

    const elapsed = Date.now() - startTime;
    const config = {
      ...DEFAULT_CHALLENGE_CONFIG,
      durationMs: CHALLENGE_DURATIONS[challengeDurationRef.current],
    };
    return getChallengeWpm(elapsed, config);
  }, []);

  // Schedule next token
  const scheduleNextTick = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isPlayingRef.current) {
      return;
    }

    const currentTokens = tokensRef.current;
    const currentIndex = indexRef.current;

    if (currentIndex >= currentTokens.length - 1) {
      setIsPlaying(false);
      // Trigger completion celebration
      celebrate("complete", "Finished!");
      return;
    }

    const effectiveWpm = getEffectiveWpm();

    if (modeRef.current === "challenge") {
      setCurrentChallengeWpm(effectiveWpm);
    }

    const currentToken = currentTokens[currentIndex];
    const interval = intervalForToken(currentToken, effectiveWpm);

    timeoutRef.current = setTimeout(() => {
      const newIndex = indexRef.current + 1;
      setIndex(newIndex);

      // Check for chapter milestone (only if we haven't celebrated this chapter already)
      if (isChapterMarker(newIndex, currentTokens) && lastCelebratedChapterRef.current !== newIndex) {
        lastCelebratedChapterRef.current = newIndex;
        celebrate("chapter", "Chapter Complete");
      }

      scheduleNextTick();
    }, interval);
  }, [getEffectiveWpm, isChapterMarker, celebrate]);

  // Track reading session on pause/stop
  const recordSession = useCallback(() => {
    if (sessionStartRef.current && documentId) {
      const wordsRead = index - sessionStartIndexRef.current;
      if (wordsRead > 0) {
        const duration = (Date.now() - sessionStartRef.current) / 1000;
        const avgWpm = Math.round((wordsRead / duration) * 60);

        statsStore.recordSession({
          documentId,
          wordsRead,
          durationSeconds: Math.round(duration),
          averageWpm: avgWpm,
          startIndex: sessionStartIndexRef.current,
          endIndex: index,
        });
      }
    }
    sessionStartRef.current = null;
  }, [documentId, index, statsStore]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      // PAUSE
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      recordSession();
      setIsPlaying(false);
      audio.pause();
    } else {
      // PLAY
      if (index >= tokens.length - 1) {
        setIndex(0);
        if (mode === "challenge") {
          setChallengeStartTime(Date.now());
        }
      }
      if (mode === "challenge" && !challengeStartTime) {
        setChallengeStartTime(Date.now());
      }
      // Start session tracking
      sessionStartRef.current = Date.now();
      sessionStartIndexRef.current = index;
      setIsPlaying(true);
      audio.play();
    }
  }, [isPlaying, index, tokens.length, audio, mode, challengeStartTime, recordSession]);

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
    recordSession();
    setIsPlaying(false);
    setIndex(0);
    setChallengeStartTime(null);
    setCurrentChallengeWpm(DEFAULT_CHALLENGE_CONFIG.startWpm);
    audio.pause();
  }, [audio, recordSession]);

  // Handle back/forward
  const handleBack = useCallback(() => {
    setIndex((prev) => Math.max(0, prev - 10));
  }, []);

  const handleForward = useCallback(() => {
    setIndex((prev) => Math.min(tokens.length - 1, prev + 10));
  }, [tokens.length]);

  // Handle jump to word (from side panel)
  const handleJumpToWord = useCallback((wordIndex: number) => {
    setIndex(wordIndex);
  }, []);

  // Handle WPM change
  const handleWpmChange = useCallback((newWpm: number) => {
    setWpm(newWpm);
    if (onboardingActive) reportOnboardingAction("wpm");
  }, [onboardingActive, reportOnboardingAction]);

  // Handle mode change
  const handleModeChange = useCallback((newMode: ReaderMode) => {
    setMode(newMode);
    if (newMode === "challenge") {
      setChallengeStartTime(null);
      setCurrentChallengeWpm(DEFAULT_CHALLENGE_CONFIG.startWpm);
    }
  }, []);

  // Handle bookmark
  const handleBookmark = useCallback(() => {
    if (!documentId) return;

    const contextStart = Math.max(0, index - 5);
    const contextEnd = Math.min(tokens.length, index + 6);
    const contextSnippet = tokens.slice(contextStart, contextEnd).join(" ");

    readerStore.addBookmark({
      id: crypto.randomUUID(),
      userId: "",
      documentId,
      tokenIndex: index,
      label: null,
      contextSnippet,
      createdAt: new Date().toISOString(),
    });
  }, [documentId, index, tokens, readerStore]);

  // Handle highlighting
  const handleToggleHighlight = useCallback(() => {
    if (!documentId) return;

    if (isHighlighting && highlightStartIndex !== null) {
      // End highlighting
      const startIdx = Math.min(highlightStartIndex, index);
      const endIdx = Math.max(highlightStartIndex, index);

      readerStore.addHighlight({
        id: crypto.randomUUID(),
        userId: "",
        documentId,
        startIndex: startIdx,
        endIndex: endIdx,
        color: "yellow",
        note: null,
        createdAt: new Date().toISOString(),
      });

      setIsHighlighting(false);
      setHighlightStartIndex(null);
    } else {
      // Start highlighting
      setIsHighlighting(true);
      setHighlightStartIndex(index);
    }
  }, [isHighlighting, highlightStartIndex, index, documentId, readerStore]);

  // Handle document select from library
  const handleDocumentSelect = useCallback((doc: { id: string; rawText: string; title: string }) => {
    const newTokens = tokenize(doc.rawText);
    setTokens(newTokens);
    setDocumentId(doc.id);
    setRawText(doc.rawText);
    setIndex(0);
    setIsLibraryOpen(false);
    readerStore.setDocument(doc.id, newTokens, doc.rawText);
  }, [readerStore]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
          if (onboardingActive) reportOnboardingAction("space");
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleBack();
          if (onboardingActive) reportOnboardingAction("arrow");
          break;
        case "ArrowRight":
          e.preventDefault();
          handleForward();
          if (onboardingActive) reportOnboardingAction("arrow");
          break;
        case "KeyR":
          e.preventDefault();
          handleRestart();
          break;
        case "KeyS":
          e.preventDefault();
          setIsSidePanelOpen((prev) => !prev);
          break;
        case "KeyL":
          e.preventDefault();
          setIsLibraryOpen((prev) => !prev);
          break;
        case "KeyB":
          e.preventDefault();
          handleBookmark();
          break;
        case "KeyH":
          e.preventDefault();
          handleToggleHighlight();
          break;
        case "Escape":
          e.preventDefault();
          if (isShortcutsModalOpen) {
            setIsShortcutsModalOpen(false);
          } else if (isSidePanelOpen) {
            setIsSidePanelOpen(false);
          } else if (isLibraryOpen) {
            setIsLibraryOpen(false);
          }
          break;
        // WPM control: + or = to increase, - to decrease
        case "Equal":
        case "NumpadAdd":
          e.preventDefault();
          if (mode === "reading") {
            setWpm((prev) => Math.min(900, prev + 25));
          }
          break;
        case "Minus":
        case "NumpadSubtract":
          e.preventDefault();
          if (mode === "reading") {
            setWpm((prev) => Math.max(100, prev - 25));
          }
          break;
        // Track navigation: , for prev, . for next
        case "Comma":
          e.preventDefault();
          audio.prevTrack();
          break;
        case "Period":
          e.preventDefault();
          audio.nextTrack();
          break;
      }

      // Check for ? key (Shift + / or ?)
      if (e.key === "?" || (e.shiftKey && e.code === "Slash")) {
        e.preventDefault();
        setIsShortcutsModalOpen(true);
        if (onboardingActive) reportOnboardingAction("help");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePlayPause, handleBack, handleForward, handleRestart, handleBookmark, handleToggleHighlight, isSidePanelOpen, isLibraryOpen, isShortcutsModalOpen, onboardingActive, reportOnboardingAction, mode, audio]);

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

  // Get bookmarks and highlights for current document
  const bookmarks = readerStore.bookmarks.filter((b) => b.documentId === documentId);
  const highlights = readerStore.highlights.filter((h) => h.documentId === documentId);
  const bookmarkedIndices = new Set(bookmarks.map((b) => b.tokenIndex));

  // Build highlighted indices set
  const highlightedIndices = new Set<number>();
  highlights.forEach((h) => {
    for (let i = h.startIndex; i <= h.endIndex; i++) {
      highlightedIndices.add(i);
    }
  });

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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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

          {/* Library button */}
          <button
            onClick={() => setIsLibraryOpen(true)}
            title="Library (L)"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 12px",
              fontSize: "14px",
              color: "var(--text-secondary)",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Bookmark button */}
          <button
            onClick={handleBookmark}
            title="Bookmark (B)"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              fontSize: "14px",
              color: "var(--text-secondary)",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          {/* Highlight button */}
          <button
            onClick={handleToggleHighlight}
            title="Highlight (H)"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              fontSize: "14px",
              color: isHighlighting ? "var(--accent)" : "var(--text-secondary)",
              backgroundColor: isHighlighting ? "var(--highlight-active)" : "var(--bg-secondary)",
              border: `1px solid ${isHighlighting ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isHighlighting) {
                e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isHighlighting) {
                e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>

          {/* Side panel button */}
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            title="Side panel (S)"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              fontSize: "14px",
              color: isSidePanelOpen ? "var(--accent)" : "var(--text-secondary)",
              backgroundColor: isSidePanelOpen ? "var(--highlight-active)" : "var(--bg-secondary)",
              border: `1px solid ${isSidePanelOpen ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isSidePanelOpen) {
                e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSidePanelOpen) {
                e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
          </button>

          <ThemeToggle />
        </div>
      </header>

      {/* Highlighting indicator */}
      {isHighlighting && (
        <div
          style={{
            padding: "8px 16px",
            backgroundColor: "var(--highlight-yellow)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontSize: "13px",
            color: "var(--text-primary)",
          }}
        >
          <span style={{ fontWeight: 500 }}>Highlighting active</span>
          <span style={{ color: "var(--text-secondary)" }}>
            Press H again to save highlight
          </span>
        </div>
      )}

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
          marginRight: isSidePanelOpen ? "360px" : 0,
          transition: "margin-right 0.2s ease",
        }}
      >
        {/* Current WPM display */}
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
          data-onboarding="rsvp-display"
          style={{
            width: "100%",
            maxWidth: "700px",
            minHeight: "140px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isHighlighting ? "var(--highlight-yellow)" : "var(--bg-secondary)",
            borderRadius: "16px",
            border: `1px solid ${isHighlighting ? "var(--accent)" : "var(--border)"}`,
            transition: "all 0.15s ease",
          }}
        >
          <RsvpWord token={currentToken} />
        </div>

        {/* Controls */}
        <div data-onboarding="reader-controls">
          <ReaderControls
            isPlaying={isPlaying}
            onPlayPause={() => {
              handlePlayPause();
              // Report to onboarding when button is clicked (for mobile)
              if (onboardingActive) reportOnboardingAction("space");
            }}
            onRestart={handleRestart}
            onBack={() => {
              handleBack();
              // Report to onboarding when button is clicked (for mobile)
              if (onboardingActive) reportOnboardingAction("arrow");
            }}
            onForward={() => {
              handleForward();
              // Report to onboarding when button is clicked (for mobile)
              if (onboardingActive) reportOnboardingAction("arrow");
            }}
            currentIndex={index}
            totalTokens={tokens.length}
          />
        </div>

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
          <div data-onboarding="wpm-slider" style={{ width: "100%", maxWidth: "320px" }}>
            <WpmSlider wpm={wpm} onChange={handleWpmChange} />
          </div>
        )}

        {/* Audio Player */}
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <AudioPlayer
            currentTrack={audio.currentTrack}
            tracks={audio.tracks}
            volume={audio.volume}
            isMuted={audio.isMuted}
            onVolumeChange={audio.setVolume}
            onToggleMute={audio.toggleMute}
            onNextTrack={audio.nextTrack}
            onPrevTrack={audio.prevTrack}
            onSelectTrack={audio.selectTrack}
          />
        </div>

        {/* Keyboard shortcuts hint - hide on mobile */}
        {!isMobile && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              fontSize: "12px",
              color: "var(--text-tertiary)",
              justifyContent: "center",
            }}
          >
            <span><kbd style={kbdStyle}>Space</kbd> Play/Pause</span>
            <span><kbd style={kbdStyle}>←</kbd><kbd style={kbdStyle}>→</kbd> Skip</span>
            <span><kbd style={kbdStyle}>R</kbd> Restart</span>
            <span><kbd style={kbdStyle}>S</kbd> Side Panel</span>
            <span><kbd style={kbdStyle}>B</kbd> Bookmark</span>
            <span><kbd style={kbdStyle}>H</kbd> Highlight</span>
            <span><kbd style={kbdStyle}>?</kbd> Help</span>
          </div>
        )}
      </div>

      {/* Side Panel */}
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        tokens={tokens}
        currentIndex={index}
        bookmarkedIndices={bookmarkedIndices}
        highlightedIndices={highlightedIndices}
        onWordClick={handleJumpToWord}
      />

      {/* Library Panel */}
      <LibraryPanel
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onDocumentSelect={handleDocumentSelect}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Celebration Overlay */}
      {celebration && (
        <CelebrationOverlay
          type={celebration.type}
          message={celebration.message}
          onComplete={clearCelebration}
        />
      )}

      {/* Onboarding Overlay */}
      <OnboardingOverlay />
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
