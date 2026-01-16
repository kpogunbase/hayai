"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if the user is on a mobile/touch device.
 * Uses touch capability detection and screen width as fallback.
 * Returns false during SSR to avoid hydration mismatches.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check for touch capability
      const hasTouch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;

      // Check screen width (768px is common mobile breakpoint)
      const isNarrowScreen = window.innerWidth < 768;

      // Consider mobile if touch device OR narrow screen
      setIsMobile(hasTouch || isNarrowScreen);
    };

    // Initial check
    checkMobile();

    // Update on resize
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}
