"use client";

import { useCallback, useState, useRef } from "react";

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
  error?: string | null;
}

const ACCEPTED_EXTENSIONS = [".txt", ".docx", ".pdf", ".epub"];
const ACCEPT_STRING = ".txt,.docx,.pdf,.epub,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/epub+zip";

function getFileIcon(filename: string) {
  const ext = filename.toLowerCase().split(".").pop();
  if (ext === "pdf") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15h6M9 11h6" />
      </svg>
    );
  }
  if (ext === "docx" || ext === "doc") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M16 13H8M16 17H8M10 9H8" />
      </svg>
    );
  }
  if (ext === "epub") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export function UploadDropzone({ onFileSelected, isLoading, error }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayError = error || localError;

  const validateAndSelectFile = useCallback(
    (file: File) => {
      setLocalError(null);
      const ext = "." + file.name.toLowerCase().split(".").pop();

      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setLocalError(`Unsupported file type. Please upload ${ACCEPTED_EXTENSIONS.join(", ")} files.`);
        return;
      }

      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSelectFile(file);
    },
    [validateAndSelectFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSelectFile(file);
    },
    [validateAndSelectFile]
  );

  const handleClick = useCallback(() => {
    if (!isLoading) fileInputRef.current?.click();
  }, [isLoading]);

  return (
    <div>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          position: "relative",
          border: `2px dashed ${isDragging ? "var(--accent)" : "var(--border-strong)"}`,
          borderRadius: "16px",
          padding: "56px 32px",
          textAlign: "center",
          cursor: isLoading ? "wait" : "pointer",
          backgroundColor: isDragging ? "var(--bg-tertiary)" : "var(--bg-secondary)",
          transition: "all 0.2s ease",
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_STRING}
          onChange={handleInputChange}
          disabled={isLoading}
          style={{ display: "none" }}
        />

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
            <p style={{ fontSize: "16px", margin: 0 }}>Processing file...</p>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
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
              Drop a file here or click to browse
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-tertiary)",
                margin: 0,
              }}
            >
              Supports TXT, DOCX, PDF, and EPUB
            </p>
          </>
        )}
      </div>

      {displayError && (
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
          {displayError}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
