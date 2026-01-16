"use client";

import { useState } from "react";
import type { Document } from "@/types/document";

interface LibraryDocumentCardProps {
  document: Document;
  onClick: () => void;
}

export function LibraryDocumentCard({ document, onClick }: LibraryDocumentCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  // Format word count
  const formatWordCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k words`;
    }
    return `${count} words`;
  };

  // Get file type icon
  const getFileTypeIcon = (fileType: Document["fileType"]): string => {
    switch (fileType) {
      case "pdf":
        return "📄";
      case "docx":
        return "📝";
      case "epub":
        return "📖";
      case "paste":
        return "📋";
      default:
        return "📃";
    }
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        backgroundColor: isHovered ? "var(--bg-secondary)" : "var(--bg-primary)",
        cursor: "pointer",
        textAlign: "left",
        transition: "background-color 150ms ease, border-color 150ms ease",
        borderColor: isHovered ? "var(--border-strong)" : "var(--border)",
      }}
    >
      {/* Title row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          marginBottom: "6px",
        }}
      >
        <span style={{ fontSize: "16px", lineHeight: 1 }}>
          {getFileTypeIcon(document.fileType)}
        </span>
        <span
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--text-primary)",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {document.title}
        </span>
      </div>

      {/* Meta row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "12px",
          color: "var(--text-tertiary)",
          paddingLeft: "24px",
        }}
      >
        <span>{formatWordCount(document.wordCount)}</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span>{formatDate(document.lastOpenedAt)}</span>
      </div>
    </button>
  );
}
