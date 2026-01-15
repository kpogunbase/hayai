"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ThemeToggle } from "@/components/ThemeToggle";
import { parseFile } from "@/lib/parse";
import { tokenize } from "@/lib/tokenize";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = useCallback(
    async (file: File) => {
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

        // Store tokens in sessionStorage for the reader page
        sessionStorage.setItem("hayai_tokens", JSON.stringify(tokens));

        // Navigate to reader
        router.push("/reader");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to process file.";
        setError(message);
        setIsLoading(false);
      }
    },
    [router]
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      {/* Header with theme toggle */}
      <header
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "16px 24px",
        }}
      >
        <ThemeToggle />
      </header>

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
    </main>
  );
}
