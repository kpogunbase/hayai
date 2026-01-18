"use client";

import { useCallback, useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UploadDropzone, UploadDropzoneRef } from "@/components/UploadDropzone";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { PaywallModal } from "@/components/PaywallModal";
import { Footer } from "@/components/Footer";
import { LibraryPanel } from "@/components/library/LibraryPanel";
import { PasteTextModal } from "@/components/upload/PasteTextModal";
import { FeedbackModal } from "@/components/FeedbackModal";
import { AnalyticsModal } from "@/components/AnalyticsModal";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { ProfileSettingsModal } from "@/components/ProfileSettingsModal";
import { OnboardingOverlay, DEMO_TEXT } from "@/components/onboarding/OnboardingOverlay";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { parseFile } from "@/lib/parse";
import { tokenize } from "@/lib/tokenize";
import { useLibraryStore } from "@/lib/stores/libraryStore";
import { useReaderStore } from "@/lib/stores/readerStore";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { saveDocument } from "@/lib/storage/documentStorage";
import {
  getLocalUsage,
  incrementLocalUsage,
  hasExceededLocalLimit,
  incrementDbUsage,
  hasExceededDbLimit,
  getDbRemaining,
  LIMITS,
} from "@/lib/usage";

type InputMethod = "upload" | "paste";
type ReadingMode = "reading" | "challenge";

interface ParsedContent {
  tokens: string[];
  text: string;
  title: string;
  fileType: string;
  filename?: string;
}

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, subscription, isLoading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();

  // Theme cycling function
  const cycleTheme = useCallback(() => {
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  }, [theme, setTheme]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [inputMethod, setInputMethod] = useState<InputMethod>("upload");
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Mode selection state (after parsing)
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null);
  const [selectedMode, setSelectedMode] = useState<ReadingMode>("reading");

  // Ref for triggering file upload
  const uploadRef = useRef<UploadDropzoneRef>(null);

  // Library state
  const isLibraryOpen = useLibraryStore((s) => s.isOpen);
  const setLibraryOpen = useLibraryStore((s) => s.setOpen);
  const loadDocuments = useLibraryStore((s) => s.loadDocuments);

  // Reader store for loading documents
  const setReaderDocument = useReaderStore((s) => s.setDocument);

  // Onboarding state
  const onboardingActive = useOnboardingStore((s) => s.isActive);
  const initializeOnboarding = useOnboardingStore((s) => s.initialize);
  const onboardingLoading = useOnboardingStore((s) => s.isLoading);

  // Initialize onboarding on mount
  useEffect(() => {
    initializeOnboarding();
  }, [initializeOnboarding]);

  // Load library documents on mount
  useEffect(() => {
    loadDocuments(user?.id);
  }, [loadDocuments, user?.id]);

  // Check for success/canceled from Stripe redirect
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  // Start reading with selected mode
  const handleStartReading = useCallback(async () => {
    if (!parsedContent) return;

    try {
      // Save to library
      const doc = await saveDocument({
        title: parsedContent.title,
        fileType: parsedContent.fileType as "txt" | "docx" | "pdf" | "epub" | "paste",
        originalFilename: parsedContent.filename,
        rawText: parsedContent.text,
      }, user?.id ?? null);

      // Set up reader with document and mode
      setReaderDocument(doc.id, parsedContent.tokens, parsedContent.text);

      // Store selected mode in session storage for reader page to pick up
      sessionStorage.setItem("hayai_mode", selectedMode);

      // Navigate to reader
      router.push("/reader");
    } catch {
      // If save fails, still proceed to reader
      sessionStorage.setItem("hayai_tokens", JSON.stringify(parsedContent.tokens));
      sessionStorage.setItem("hayai_mode", selectedMode);
      router.push("/reader");
    }
  }, [parsedContent, selectedMode, user?.id, setReaderDocument, router]);

  // Reset to initial state (upload new file)
  const handleUploadNew = useCallback(() => {
    setParsedContent(null);
    setSelectedMode("reading");
    setError(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Mode selection shortcuts (when content is parsed)
      if (parsedContent) {
        if (e.key === "1" || e.key.toLowerCase() === "r") {
          e.preventDefault();
          setSelectedMode("reading");
        } else if (e.key === "2" || e.key.toLowerCase() === "c") {
          e.preventDefault();
          setSelectedMode("challenge");
        } else if (e.key === "Enter") {
          e.preventDefault();
          handleStartReading();
        } else if (e.key.toLowerCase() === "n") {
          e.preventDefault();
          handleUploadNew();
        } else if (e.key === "Escape") {
          e.preventDefault();
          handleUploadNew();
        }
        return;
      }

      // Tab to switch between upload and paste
      if (e.key === "Tab" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only intercept if no modal is open
        if (!showPasteModal && !showFeedbackModal && !showAnalyticsModal && !isLibraryOpen) {
          e.preventDefault();
          setInputMethod(prev => prev === "upload" ? "paste" : "upload");
        }
        return;
      }

      // Shift+U to trigger file upload
      if (e.shiftKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        setInputMethod("upload");
        // Small delay to ensure the dropzone is visible
        setTimeout(() => uploadRef.current?.triggerUpload(), 50);
        return;
      }

      // Shift+P to open paste modal
      if (e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setInputMethod("paste");
        setShowPasteModal(true);
        return;
      }

      // 1/2 to switch input method tabs (when not in mode selection)
      if (e.key === "1") {
        e.preventDefault();
        setInputMethod("upload");
        return;
      }
      if (e.key === "2") {
        e.preventDefault();
        setInputMethod("paste");
        return;
      }

      if (e.key.toLowerCase() === "l") {
        setLibraryOpen(!isLibraryOpen);
      } else if (e.key.toLowerCase() === "f" && !e.shiftKey) {
        e.preventDefault();
        setShowFeedbackModal(true);
      } else if (e.key.toLowerCase() === "a") {
        e.preventDefault();
        setShowAnalyticsModal(true);
      } else if (e.key.toLowerCase() === "t" && !e.shiftKey) {
        e.preventDefault();
        cycleTheme();
      } else if (e.key === "?" || (e.shiftKey && e.code === "Slash")) {
        e.preventDefault();
        setShowShortcutsModal(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        if (user) {
          setShowProfileModal(true);
        }
      } else if (e.key === "Escape") {
        if (showProfileModal) {
          setShowProfileModal(false);
        } else if (showShortcutsModal) {
          setShowShortcutsModal(false);
        } else if (showAnalyticsModal) {
          setShowAnalyticsModal(false);
        } else if (showFeedbackModal) {
          setShowFeedbackModal(false);
        } else if (showPasteModal) {
          setShowPasteModal(false);
        } else if (isLibraryOpen) {
          setLibraryOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLibraryOpen, setLibraryOpen, showPasteModal, showFeedbackModal, showAnalyticsModal, showShortcutsModal, showProfileModal, parsedContent, selectedMode, handleStartReading, handleUploadNew, cycleTheme, user]);

  // Process file and show mode selection (or navigate directly on mobile)
  const processContent = useCallback(
    async (
      text: string,
      title: string,
      fileType: string,
      filename?: string
    ) => {
      const tokens = tokenize(text);

      if (tokens.length === 0) {
        setError("No readable text found in the content.");
        setIsLoading(false);
        return;
      }

      // Store parsed content for mode selection
      setParsedContent({ tokens, text, title, fileType, filename });
      setIsLoading(false);
    },
    []
  );

  // Direct navigation (used by onboarding/demo)
  const processAndNavigate = useCallback(
    async (
      text: string,
      title: string,
      fileType: string,
      filename?: string
    ) => {
      const tokens = tokenize(text);

      if (tokens.length === 0) {
        setError("No readable text found in the content.");
        setIsLoading(false);
        return;
      }

      // Save to library
      try {
        const doc = await saveDocument({
          title,
          fileType: fileType as "txt" | "docx" | "pdf" | "epub" | "paste",
          originalFilename: filename,
          rawText: text,
        }, user?.id ?? null);

        // Set up reader with document
        setReaderDocument(doc.id, tokens, text);
      } catch {
        // If save fails (e.g., duplicate), still proceed to reader
        sessionStorage.setItem("hayai_tokens", JSON.stringify(tokens));
      }

      // Navigate to reader
      router.push("/reader");
    },
    [router, user?.id, setReaderDocument]
  );

  const handleFileSelected = useCallback(
    async (file: File) => {
      // DISABLED: Usage limits and paywall - uncomment to re-enable
      // if (user) {
      //   const exceeded = await hasExceededDbLimit(
      //     user.id,
      //     subscription?.plan ?? null,
      //     subscription?.currentPeriodEnd ?? null
      //   );
      //   if (exceeded) {
      //     setShowPaywall(true);
      //     return;
      //   }
      // } else {
      //   if (hasExceededLocalLimit()) {
      //     setShowPaywall(true);
      //     return;
      //   }
      // }

      setIsLoading(true);
      setError(null);

      try {
        const text = await parseFile(file);

        // DISABLED: Usage tracking - uncomment to re-enable
        // if (user) {
        //   await incrementDbUsage(user.id);
        // } else {
        //   incrementLocalUsage();
        // }

        // Get file type from extension
        const ext = file.name.split(".").pop()?.toLowerCase() || "txt";

        await processContent(text, file.name, ext, file.name);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to process file.";
        setError(message);
        setIsLoading(false);
      }
    },
    [user, subscription, processContent]
  );

  const handlePasteSubmit = useCallback(
    async (text: string, title: string) => {
      // DISABLED: Usage limits and paywall - uncomment to re-enable
      // if (user) {
      //   const exceeded = await hasExceededDbLimit(
      //     user.id,
      //     subscription?.plan ?? null,
      //     subscription?.currentPeriodEnd ?? null
      //   );
      //   if (exceeded) {
      //     setShowPasteModal(false);
      //     setShowPaywall(true);
      //     return;
      //   }
      // } else {
      //   if (hasExceededLocalLimit()) {
      //     setShowPasteModal(false);
      //     setShowPaywall(true);
      //     return;
      //   }
      // }

      setIsLoading(true);
      setShowPasteModal(false);

      try {
        // DISABLED: Usage tracking - uncomment to re-enable
        // if (user) {
        //   await incrementDbUsage(user.id);
        // } else {
        //   incrementLocalUsage();
        // }

        await processContent(text, title, "paste");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to process text.";
        setError(message);
        setIsLoading(false);
      }
    },
    [user, subscription, processContent]
  );

  // Handle document selection from library
  const handleDocumentSelect = useCallback(
    (doc: { id: string; rawText: string; title: string }) => {
      const tokens = tokenize(doc.rawText);
      setReaderDocument(doc.id, tokens, doc.rawText);
      setLibraryOpen(false);
      router.push("/reader");
    },
    [router, setReaderDocument, setLibraryOpen]
  );

  // Track remaining uploads for display
  const [remainingUploads, setRemainingUploads] = useState<number | string>("...");

  useEffect(() => {
    const fetchRemaining = async () => {
      if (authLoading) {
        setRemainingUploads("...");
        return;
      }

      if (subscription?.plan === "yearly") {
        setRemainingUploads("Unlimited");
        return;
      }

      if (user) {
        const remaining = await getDbRemaining(
          user.id,
          subscription?.plan ?? null,
          subscription?.currentPeriodEnd ?? null
        );
        if (remaining === Infinity) {
          setRemainingUploads("Unlimited");
        } else {
          setRemainingUploads(remaining);
        }
      } else {
        const used = getLocalUsage();
        setRemainingUploads(Math.max(0, LIMITS.anonymous - used));
      }
    };

    fetchRemaining();
  }, [user, subscription, authLoading]);

  // Handle demo text from onboarding
  const handleLoadDemoText = useCallback(
    async (text: string) => {
      setIsLoading(true);
      try {
        await processAndNavigate(text, "Demo Text", "paste");
      } catch {
        setError("Failed to load demo text.");
        setIsLoading(false);
      }
    },
    [processAndNavigate]
  );

  return (
    <>
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
          padding: isMobile ? "12px 16px" : "16px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "8px" : "12px" }}>
          <ThemeToggle />
          {/* Library button */}
          <button
            onClick={() => setLibraryOpen(true)}
            title="Library (L)"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: isMobile ? "8px" : "8px 12px",
              fontSize: "14px",
              color: "var(--text-secondary)",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              minWidth: isMobile ? "36px" : "auto",
              minHeight: isMobile ? "36px" : "auto",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            {!isMobile && "Library"}
          </button>
          {/* Analytics button */}
          <button
            onClick={() => setShowAnalyticsModal(true)}
            title="Analytics (A)"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: isMobile ? "8px" : "8px 12px",
              fontSize: "14px",
              color: "var(--text-secondary)",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              minWidth: isMobile ? "36px" : "auto",
              minHeight: isMobile ? "36px" : "auto",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 3v18h18" />
              <path d="M18 17V9" />
              <path d="M13 17V5" />
              <path d="M8 17v-3" />
            </svg>
            {!isMobile && "Analytics"}
          </button>
          {/* Feedback button */}
          <button
            onClick={() => setShowFeedbackModal(true)}
            title="Send Feedback (F)"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: isMobile ? "8px" : "8px 12px",
              fontSize: "14px",
              color: "var(--text-secondary)",
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              minWidth: isMobile ? "36px" : "auto",
              minHeight: isMobile ? "36px" : "auto",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {!isMobile && "Feedback"}
          </button>
        </div>
        {/* DISABLED: onUpgradeClick prop removed to hide upgrade option */}
        <UserMenu />
      </header>

      {/* Success message */}
      {showSuccess && (
        <div
          style={{
            margin: "0 24px",
            padding: "12px 16px",
            background: "var(--success-bg)",
            border: "1px solid var(--success-border)",
            borderRadius: "8px",
            color: "var(--success)",
            fontSize: "14px",
            textAlign: "center",
            boxShadow: "var(--success-glow)",
          }}
        >
          Welcome to Hayai Pro! You now have unlimited uploads.
          <button
            onClick={() => setShowSuccess(false)}
            style={{
              marginLeft: "12px",
              padding: "2px 8px",
              fontSize: "12px",
              color: "inherit",
              backgroundColor: "transparent",
              border: "1px solid currentColor",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Dismiss
          </button>
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
          padding: isMobile ? "16px" : "24px",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
          }}
        >
          {/* Logo/Title */}
          <div style={{ textAlign: "center", marginBottom: isMobile ? "32px" : "48px" }}>
            <h1
              style={{
                fontSize: isMobile ? "28px" : "38px",
                fontWeight: 500,
                marginBottom: "12px",
                color: "var(--text-primary)",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
              }}
            >
              Hayai
            </h1>
            <p
              style={{
                fontSize: isMobile ? "15px" : "17px",
                color: "var(--text-secondary)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              High-speed reading with focus audio
            </p>
          </div>

          {/* Mode selection (after parsing) */}
          {parsedContent ? (
            <>
              {/* Document info */}
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "12px",
                  marginBottom: "16px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    margin: "0 auto 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "var(--bg-tertiary)",
                    borderRadius: "12px",
                    color: "var(--accent)",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    margin: "0 0 4px",
                    wordBreak: "break-word",
                  }}
                >
                  {parsedContent.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    margin: 0,
                  }}
                >
                  {parsedContent.tokens.length.toLocaleString()} words
                </p>
              </div>

              {/* Mode selector */}
              <div
                style={{
                  display: "flex",
                  marginBottom: "16px",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "10px",
                  padding: "4px",
                }}
              >
                <button
                  onClick={() => setSelectedMode("reading")}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: 500,
                    color:
                      selectedMode === "reading"
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    backgroundColor:
                      selectedMode === "reading"
                        ? "var(--bg-primary)"
                        : "transparent",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow:
                      selectedMode === "reading"
                        ? "0 1px 3px var(--shadow)"
                        : "none",
                  }}
                >
                  <span style={{ display: "block", marginBottom: "2px" }}>Reading Mode</span>
                  {!isMobile && (
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      Manual WPM control
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setSelectedMode("challenge")}
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    fontSize: "14px",
                    fontWeight: 500,
                    color:
                      selectedMode === "challenge"
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    backgroundColor:
                      selectedMode === "challenge"
                        ? "var(--bg-primary)"
                        : "transparent",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow:
                      selectedMode === "challenge"
                        ? "0 1px 3px var(--shadow)"
                        : "none",
                  }}
                >
                  <span style={{ display: "block", marginBottom: "2px" }}>Challenge Mode</span>
                  {!isMobile && (
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      Auto-ramp to 900 WPM
                    </span>
                  )}
                </button>
              </div>

              {/* Start button */}
              <button
                onClick={handleStartReading}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#fff",
                  background: "var(--accent-gradient)",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  marginBottom: "12px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px var(--shadow)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Start Reading
              </button>

              {/* Upload new button */}
              <button
                onClick={handleUploadNew}
                style={{
                  width: "100%",
                  padding: "12px 24px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  backgroundColor: "transparent",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                Upload Different File
              </button>

              {/* Keyboard hints */}
              {!isMobile && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-tertiary)",
                    marginTop: "16px",
                    textAlign: "center",
                  }}
                >
                  <kbd style={kbdStyle}>1</kbd> Reading <kbd style={kbdStyle}>2</kbd> Challenge <kbd style={kbdStyle}>Enter</kbd> Start <kbd style={kbdStyle}>N</kbd> New file
                </p>
              )}
            </>
          ) : (
            <>
              {/* Input method selector */}
              <div
                style={{
                  display: "flex",
                  marginBottom: "16px",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "10px",
                  padding: "4px",
                }}
              >
                <button
                  onClick={() => setInputMethod("upload")}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    fontSize: "14px",
                    fontWeight: 500,
                    color:
                      inputMethod === "upload"
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    backgroundColor:
                      inputMethod === "upload"
                        ? "var(--bg-primary)"
                        : "transparent",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow:
                      inputMethod === "upload"
                        ? "0 1px 3px var(--shadow)"
                        : "none",
                  }}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setInputMethod("paste")}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    fontSize: "14px",
                    fontWeight: 500,
                    color:
                      inputMethod === "paste"
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    backgroundColor:
                      inputMethod === "paste"
                        ? "var(--bg-primary)"
                        : "transparent",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    boxShadow:
                      inputMethod === "paste" ? "0 1px 3px var(--shadow)" : "none",
                  }}
                >
                  Paste Text
                </button>
              </div>

              {/* Upload dropzone or Paste button */}
              {inputMethod === "upload" ? (
                <div data-onboarding="upload">
                  <UploadDropzone
                    ref={uploadRef}
                    onFileSelected={handleFileSelected}
                    isLoading={isLoading}
                    error={error}
                  />
                </div>
              ) : (
                <div
              onClick={() => !isLoading && setShowPasteModal(true)}
              style={{
                border: "2px dashed var(--border-strong)",
                borderRadius: "16px",
                padding: "56px 32px",
                textAlign: "center",
                cursor: isLoading ? "wait" : "pointer",
                backgroundColor: "var(--bg-secondary)",
                transition: "all 0.2s ease",
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-strong)";
                e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
              }}
            >
              {isLoading ? (
                <div style={{ color: "var(--text-secondary)" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      margin: "0 auto 16px",
                      border: "3px solid var(--border)",
                      borderTopColor: "var(--accent)",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <p style={{ fontSize: "16px", margin: 0 }}>
                    Processing text...
                  </p>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      margin: "0 auto 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "var(--bg-tertiary)",
                      borderRadius: "12px",
                      color: "var(--accent)",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                  </div>
                  <p
                    style={{
                      fontSize: "17px",
                      fontWeight: 500,
                      marginBottom: "8px",
                      color: "var(--text-primary)",
                    }}
                  >
                    Click to paste text
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--text-tertiary)",
                      margin: 0,
                    }}
                  >
                    Paste any text content to start reading
                  </p>
                </>
              )}
            </div>
          )}

              {/* Error display for paste mode */}
              {inputMethod === "paste" && error && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px 16px",
                    backgroundColor: "rgba(220, 38, 38, 0.1)",
                    border: "1px solid rgba(220, 38, 38, 0.2)",
                    borderRadius: "8px",
                    color: "var(--orp-highlight)",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </div>
              )}

              {/* DISABLED: Usage info and upgrade button - set to true to re-enable */}
              {false && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "20px",
                  padding: "12px 16px",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>
                  {remainingUploads === "Unlimited" ? (
                    <>
                      <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                        Pro
                      </span>{" "}
                      — Unlimited uploads
                    </>
                  ) : subscription?.plan === "monthly" ? (
                    <>
                      <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                        Pro
                      </span>{" "}
                      — {remainingUploads} uploads remaining this month
                    </>
                  ) : (
                    <>Uploads remaining: {remainingUploads}</>
                  )}
                </span>
                {subscription?.status !== "active" && (
                  <button
                    onClick={() => setShowPaywall(true)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--accent)",
                      backgroundColor: "transparent",
                      border: "1px solid var(--accent)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--accent)";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--accent)";
                    }}
                  >
                    Upgrade
                  </button>
                )}
              </div>
              )}

              {/* Footer hint */}
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-tertiary)",
                  marginTop: "24px",
                  textAlign: "center",
                }}
              >
                Your files are processed locally and never uploaded to any server.
              </p>

              {/* Keyboard hint - hide on mobile */}
              {!isMobile && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-tertiary)",
                    marginTop: "8px",
                    textAlign: "center",
                  }}
                >
                  <kbd style={kbdStyle}>Tab</kbd> Switch <kbd style={kbdStyle}>Shift+U</kbd> Upload <kbd style={kbdStyle}>T</kbd> Theme <kbd style={kbdStyle}>?</kbd> Help
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Library Panel */}
      <LibraryPanel
        isOpen={isLibraryOpen}
        onClose={() => setLibraryOpen(false)}
        onDocumentSelect={handleDocumentSelect}
      />

      {/* Paste Text Modal */}
      <PasteTextModal
        isOpen={showPasteModal}
        onClose={() => setShowPasteModal(false)}
        onSubmit={handlePasteSubmit}
        isLoading={isLoading}
      />

      {/* Paywall Modal */}
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        page="home"
      />

      {/* Analytics Modal */}
      <AnalyticsModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
        page="home"
      />

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Onboarding Overlay */}
      {!onboardingLoading && (
        <OnboardingOverlay onLoadDemoText={handleLoadDemoText} />
      )}

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>

    <Footer />
    </>
  );
}

const kbdStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 6px",
  fontSize: "11px",
  fontFamily: "inherit",
  backgroundColor: "var(--bg-tertiary)",
  borderRadius: "4px",
  border: "1px solid var(--border)",
};

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }} />
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
