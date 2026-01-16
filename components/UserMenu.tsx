"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { StatsPanel } from "./stats/StatsPanel";
import { ProfileSettingsModal } from "./ProfileSettingsModal";
import { useOnboardingStore } from "@/lib/stores/onboardingStore";
import { getProfile, Profile } from "@/lib/profile";
import { isValidRedirectUrl } from "@/lib/security";

interface UserMenuProps {
  onUpgradeClick?: () => void;
}

export function UserMenu({ onUpgradeClick }: UserMenuProps) {
  const { user, subscription, isLoading, signInWithGoogle, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const startOnboarding = useOnboardingStore((s) => s.startOnboarding);
  const resetOnboarding = useOnboardingStore((s) => s.resetOnboarding);

  // Load profile
  useEffect(() => {
    if (user) {
      getProfile(user.id).then(setProfile);
    } else {
      setProfile(null);
    }
  }, [user]);

  // Refresh profile when modal closes
  useEffect(() => {
    if (!showProfile && user) {
      getProfile(user.id).then(setProfile);
    }
  }, [showProfile, user]);

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
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={signInWithGoogle}
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--text-secondary)",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          Sign in
        </button>
        <button
          onClick={signInWithGoogle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#fff",
            backgroundColor: "var(--accent)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "opacity 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          Sign up free
        </button>
      </div>
    );
  }

  const isSubscribed = subscription?.status === "active";
  const displayName = profile?.username || user.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const avatarUrl = profile?.avatar_url;

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
            backgroundColor: avatarUrl ? "transparent" : "var(--accent)",
            backgroundImage: avatarUrl ? `url(${avatarUrl})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {!avatarUrl && initial}
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
              minWidth: "220px",
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              boxShadow: "0 4px 12px var(--shadow-lg)",
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            {/* User info header */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: avatarUrl ? "transparent" : "var(--accent)",
                  backgroundImage: avatarUrl ? `url(${avatarUrl})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {!avatarUrl && initial}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {profile?.username || user.email?.split("@")[0]}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: isSubscribed ? "var(--accent)" : "var(--text-tertiary)",
                    margin: "2px 0 0",
                  }}
                >
                  {isSubscribed
                    ? `${subscription.plan === "yearly" ? "Yearly" : "Monthly"} Pro`
                    : "Free Plan"}
                </p>
              </div>
            </div>

            {/* Profile Settings */}
            <button
              onClick={() => {
                setIsOpen(false);
                setShowProfile(true);
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Profile Settings
            </button>

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
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
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
                  if (url && isValidRedirectUrl(url)) {
                    window.location.href = url;
                  }
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
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Manage Subscription
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
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </>
      )}

      {/* Stats Panel */}
      <StatsPanel isOpen={showStats} onClose={() => setShowStats(false)} />

      {/* Profile Settings Modal */}
      <ProfileSettingsModal isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
}
