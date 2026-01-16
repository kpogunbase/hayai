"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";
import { getProfile, upsertProfile, uploadAvatar, Profile } from "@/lib/profile";
import { isValidRedirectUrl } from "@/lib/security";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { user, subscription } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile on open
  useEffect(() => {
    if (isOpen && user) {
      setIsLoading(true);
      getProfile(user.id).then((p) => {
        setProfile(p);
        setUsername(p?.username || "");
        setAvatarUrl(p?.avatar_url || null);
        setIsLoading(false);
      });
    }
  }, [isOpen, user]);

  // Clear messages on close
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const result = await upsertProfile(user.id, {
      username: username || undefined,
      avatar_url: avatarUrl || undefined,
    });

    if (result.success) {
      setSuccess("Profile saved successfully");
      // Refresh profile
      const updated = await getProfile(user.id);
      setProfile(updated);
    } else {
      setError(result.error || "Failed to save profile");
    }

    setIsSaving(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsSaving(true);
    setError(null);

    const result = await uploadAvatar(user.id, file);

    if (result.url) {
      setAvatarUrl(result.url);
      // Auto-save the new avatar
      await upsertProfile(user.id, { avatar_url: result.url });
      setSuccess("Avatar updated");
    } else {
      setError(result.error || "Failed to upload avatar");
    }

    setIsSaving(false);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleManageSubscription = async () => {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url, error } = await res.json();
      if (url && isValidRedirectUrl(url)) {
        window.location.href = url;
      } else {
        setError(error || "Failed to open billing portal");
      }
    } catch {
      setError("Failed to open billing portal");
    }
  };

  if (!isOpen) return null;

  const displayName = profile?.username || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();
  const isSubscribed = subscription?.status === "active";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          maxWidth: "480px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          backgroundColor: "var(--bg-primary)",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 24px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Profile Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--bg-tertiary)",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
              Loading...
            </div>
          ) : (
            <>
              {/* Avatar */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div
                  onClick={handleAvatarClick}
                  style={{
                    width: "96px",
                    height: "96px",
                    margin: "0 auto 12px",
                    borderRadius: "50%",
                    backgroundColor: avatarUrl ? "transparent" : "var(--accent)",
                    backgroundImage: avatarUrl ? `url(${avatarUrl})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    position: "relative",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  {!avatarUrl && (
                    <span style={{ fontSize: "36px", fontWeight: 600, color: "#fff" }}>
                      {initial}
                    </span>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      width: "28px",
                      height: "28px",
                      backgroundColor: "var(--bg-primary)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid var(--bg-primary)",
                      boxShadow: "0 2px 4px var(--shadow)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <p style={{ fontSize: "13px", color: "var(--text-tertiary)", margin: 0 }}>
                  Click to upload a photo
                </p>
              </div>

              {/* Username */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    marginBottom: "8px",
                  }}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="Choose a username"
                  maxLength={20}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "15px",
                    color: "var(--text-primary)",
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                />
                <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "6px" }}>
                  3-20 characters, letters, numbers, and underscores only
                </p>
              </div>

              {/* Email (read-only) */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    marginBottom: "8px",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "15px",
                    color: "var(--text-tertiary)",
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    cursor: "not-allowed",
                  }}
                />
              </div>

              {/* Subscription Status */}
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "var(--bg-secondary)",
                  borderRadius: "12px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        margin: "0 0 4px",
                      }}
                    >
                      Subscription
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: isSubscribed ? "var(--accent)" : "var(--text-tertiary)",
                        margin: 0,
                      }}
                    >
                      {isSubscribed
                        ? `${subscription?.plan === "yearly" ? "Yearly" : "Monthly"} Pro`
                        : "Free Plan"}
                    </p>
                  </div>
                  {isSubscribed && (
                    <button
                      onClick={handleManageSubscription}
                      style={{
                        padding: "8px 16px",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--text-secondary)",
                        backgroundColor: "var(--bg-tertiary)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--bg-primary)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
                      }}
                    >
                      Manage
                    </button>
                  )}
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "rgba(220, 38, 38, 0.1)",
                    border: "1px solid rgba(220, 38, 38, 0.2)",
                    borderRadius: "8px",
                    color: "#dc2626",
                    fontSize: "14px",
                    marginBottom: "16px",
                  }}
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                    borderRadius: "8px",
                    color: "#22c55e",
                    fontSize: "14px",
                    marginBottom: "16px",
                  }}
                >
                  {success}
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#fff",
                  backgroundColor: "var(--accent)",
                  border: "none",
                  borderRadius: "10px",
                  cursor: isSaving ? "wait" : "pointer",
                  opacity: isSaving ? 0.7 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
