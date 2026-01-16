"use client";

interface LibraryEmptyStateProps {
  hasSearchQuery: boolean;
}

export function LibraryEmptyState({ hasSearchQuery }: LibraryEmptyStateProps) {
  if (hasSearchQuery) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "32px",
            marginBottom: "12px",
          }}
        >
          🔍
        </div>
        <p
          style={{
            fontSize: "14px",
            color: "var(--text-secondary)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          No documents match your search.
        </p>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-tertiary)",
            margin: "8px 0 0",
            lineHeight: 1.5,
          }}
        >
          Try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "32px",
          marginBottom: "12px",
        }}
      >
        📚
      </div>
      <p
        style={{
          fontSize: "14px",
          color: "var(--text-secondary)",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        Your library is empty.
      </p>
      <p
        style={{
          fontSize: "13px",
          color: "var(--text-tertiary)",
          margin: "8px 0 0",
          lineHeight: 1.5,
        }}
      >
        Upload a document to get started.
      </p>
    </div>
  );
}
