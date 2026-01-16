"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { StatsPanel } from "./stats/StatsPanel";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";

interface UserMenuProps {
  onUpgradeClick?: () => void;
}

export function UserMenu({ onUpgradeClick }: UserMenuProps) {
  const { user, subscription, isLoading, signInWithGoogle, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const startOnboarding = useOnboardingStore((s) => s.startOnboarding);
  const resetOnboarding = useOnboardingStore((s) => s.resetOnboarding);

  if (isLoading) {
    return (
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          backgroundColor: "var(--bg-tertiary)",
        }}
      />
    );
  }

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          fontSize: "14px",
          fontWeight: 500,
          color: "var(--text-primary)",
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
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in
      </button>
    );
  }

  const isSubscribed = subscription?.status === "active";
  const initial = user.email?.charAt(0).toUpperCase() || "U";

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 8px 4px 4px",
          fontSize: "14px",
          color: "var(--text-primary)",
          backgroundColor: "transparent",
          border: "1px solid var(--border)",
          borderRadius: "24px",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--border-strong)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            backgroundColor: "var(--accent)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {initial}
        </div>
        {isSubscribed && (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--accent)",
              textTransform: "uppercase",
            }}
          >
            Pro
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              minWidth: "200px",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              boxShadow: "0 4px 12px var(--shadow-lg)",
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                {user.email}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: isSubscribed ? "var(--accent)" : "var(--text-tertiary)",
                  margin: "4px 0 0",
                }}
              >
                {isSubscribed
                  ? `${subscription.plan === "yearly" ? "Yearly" : "Monthly"} Plan`
                  : "Free Plan"}
              </p>
            </div>

            {!isSubscribed && onUpgradeClick && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onUpgradeClick();
                }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--accent)",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Upgrade to Pro
              </button>
            )}

            {isSubscribed && (
              <button
                onClick={async () => {
                  setIsOpen(false);
                  const res = await fetch("/api/stripe/portal", {
                    method: "POST",
                  });
                  const { url } = await res.json();
                  window.location.href = url;
                }}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Manage subscription
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                setShowStats(true);
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "14px",
                color: "var(--text-secondary)",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                textAlign: "left",
                transition: "background-color 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 20V10M12 20V4M6 20v-6" />
              </svg>
              Reading Stats
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                resetOnboarding();
                startOnboarding();
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "14px",
                color: "var(--text-secondary)",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: "1px solid var(--border)",
                cursor: "pointer",
                textAlign: "left",
                transition: "background-color 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              Replay Tutorial
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "14px",
                color: "var(--text-secondary)",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Sign out
            </button>
          </div>
        </>
      )}

      {/* Stats Panel */}
      <StatsPanel isOpen={showStats} onClose={() => setShowStats(false)} />
    </div>
  );
}
