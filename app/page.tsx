"use client";

import { useCallback, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { PaywallModal } from "@/components/PaywallModal";
import { useAuth } from "@/components/AuthProvider";
import { parseFile } from "@/lib/parse";
import { tokenize } from "@/lib/tokenize";
import {
  getLocalUsage,
  incrementLocalUsage,
  hasExceededLocalLimit,
  incrementDbUsage,
  hasExceededDbLimit,
} from "@/lib/usage";

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, subscription, isLoading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check for success/canceled from Stripe redirect
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
      // Clear the URL params
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  const isSubscribed = subscription?.status === "active";

  const handleFileSelected = useCallback(
    async (file: File) => {
      // Check usage limits before processing
      if (!isSubscribed) {
        if (user) {
          // Authenticated user - check DB
          const exceeded = await hasExceededDbLimit(user.id);
          if (exceeded) {
            setShowPaywall(true);
            return;
          }
        } else {
          // Anonymous user - check localStorage
          if (hasExceededLocalLimit()) {
            setShowPaywall(true);
            return;
          }
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        // Parse file to extract text
        const text = await parseFile(file);

        // Tokenize the text
        const tokens = tokenize(text);

        if (tokens.length === 0) {
          setError("No readable text found in the file.");
          setIsLoading(false);
          return;
        }

        // Increment usage (only if not subscribed)
        if (!isSubscribed) {
          if (user) {
            await incrementDbUsage(user.id);
          } else {
            incrementLocalUsage();
          }
        }

        // Store tokens in sessionStorage for the reader page
        sessionStorage.setItem("hayai_tokens", JSON.stringify(tokens));

        // Navigate to reader
        router.push("/reader");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to process file.";
        setError(message);
        setIsLoading(false);
      }
    },
    [router, user, isSubscribed]
  );

  // Calculate remaining uploads
  const getRemainingUploads = () => {
    if (isSubscribed) return "Unlimited";
    if (authLoading) return "...";

    const used = user ? 0 : getLocalUsage(); // For anonymous, we show local. DB check happens on upload.
    const remaining = Math.max(0, 3 - used);
    return remaining;
  };

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
        }}
      >
        <ThemeToggle />
        <UserMenu onUpgradeClick={() => setShowPaywall(true)} />
      </header>

      {/* Success message */}
      {showSuccess && (
        <div
          style={{
            margin: "0 24px",
            padding: "12px 16px",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            borderRadius: "8px",
            color: "#22c55e",
            fontSize: "14px",
            textAlign: "center",
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
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
          }}
        >
          {/* Logo/Title */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h1
              style={{
                fontSize: "42px",
                fontWeight: 700,
                marginBottom: "12px",
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Hayai
            </h1>
            <p
              style={{
                fontSize: "17px",
                color: "var(--text-secondary)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              High-speed reading with focus audio
            </p>
          </div>

          {/* Upload dropzone */}
          <UploadDropzone
            onFileSelected={handleFileSelected}
            isLoading={isLoading}
            error={error}
          />

          {/* Usage info */}
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
              {isSubscribed ? (
                <>
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                    Pro
                  </span>{" "}
                  — Unlimited uploads
                </>
              ) : (
                <>Uploads remaining: {getRemainingUploads()}</>
              )}
            </span>
            {!isSubscribed && (
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
        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }} />}>
      <HomePageContent />
    </Suspense>
  );
}
