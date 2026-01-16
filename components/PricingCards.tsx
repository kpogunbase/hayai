"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { LIMITS } from "@/lib/usage";

interface PricingCardsProps {
  onClose?: () => void;
}

export function PricingCards({ onClose }: PricingCardsProps) {
  const { user, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    if (!user) {
      // Redirect to sign in first
      signInWithGoogle();
      return;
    }

    setLoading(plan);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            backgroundColor: "rgba(220, 38, 38, 0.1)",
            border: "1px solid rgba(220, 38, 38, 0.2)",
            borderRadius: "8px",
            color: "#dc2626",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* Monthly Plan */}
        <div
          style={{
            flex: "1 1 200px",
            maxWidth: "260px",
            padding: "24px",
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: "0 0 8px",
            }}
          >
            Monthly
          </h3>
          <div style={{ marginBottom: "16px" }}>
            <span
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              $2.99
            </span>
            <span
              style={{
                fontSize: "14px",
                color: "var(--text-tertiary)",
                marginLeft: "4px",
              }}
            >
              /month
            </span>
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 20px",
              fontSize: "14px",
              color: "var(--text-secondary)",
            }}
          >
            <li style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {LIMITS.monthly} uploads/month
            </li>
            <li style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              All reading modes
            </li>
            <li style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Focus audio tracks
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Cancel anytime
            </li>
          </ul>
          <button
            onClick={() => handleSubscribe("monthly")}
            disabled={loading !== null}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--text-primary)",
              backgroundColor: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              cursor: loading ? "wait" : "pointer",
              opacity: loading && loading !== "monthly" ? 0.5 : 1,
              transition: "all 0.15s ease",
            }}
          >
            {loading === "monthly" ? "Loading..." : "Subscribe Monthly"}
          </button>
        </div>

        {/* Yearly Plan */}
        <div
          style={{
            flex: "1 1 200px",
            maxWidth: "260px",
            padding: "24px",
            backgroundColor: "var(--bg-secondary)",
            border: "2px solid var(--accent)",
            borderRadius: "16px",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-12px",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "4px 12px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#fff",
              backgroundColor: "var(--accent)",
              borderRadius: "12px",
              textTransform: "uppercase",
            }}
          >
            Best Value
          </div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: "0 0 8px",
            }}
          >
            Yearly
          </h3>
          <div style={{ marginBottom: "16px" }}>
            <span
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              $20
            </span>
            <span
              style={{
                fontSize: "14px",
                color: "var(--text-tertiary)",
                marginLeft: "4px",
              }}
            >
              /year
            </span>
            <div
              style={{
                fontSize: "12px",
                color: "var(--accent)",
                marginTop: "4px",
                fontWeight: 500,
              }}
            >
              $1.67/month — Save 44%
            </div>
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 20px",
              fontSize: "14px",
              color: "var(--text-secondary)",
            }}
          >
            <li style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <strong style={{ color: "var(--text-primary)" }}>Unlimited</strong> uploads
            </li>
            <li style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              All reading modes
            </li>
            <li style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Focus audio tracks
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Priority support
            </li>
          </ul>
          <button
            onClick={() => handleSubscribe("yearly")}
            disabled={loading !== null}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#fff",
              backgroundColor: "var(--accent)",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "wait" : "pointer",
              opacity: loading && loading !== "yearly" ? 0.5 : 1,
              transition: "all 0.15s ease",
            }}
          >
            {loading === "yearly" ? "Loading..." : "Subscribe Yearly"}
          </button>
        </div>
      </div>
    </div>
  );
}
