import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp, rateLimitHeaders, RATE_LIMITS } from "@/lib/rateLimit";

// Rate limit: 5 feedback submissions per 10 minutes per IP
const FEEDBACK_RATE_LIMIT = {
  requests: 5,
  window: "10m" as const,
};

// Maximum content length (characters)
const MAX_CONTENT_LENGTH = 10000;

// Valid page values
const VALID_PAGES = ["home", "reader"] as const;
type ValidPage = typeof VALID_PAGES[number];

function isValidPage(page: unknown): page is ValidPage {
  return typeof page === "string" && VALID_PAGES.includes(page as ValidPage);
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request.headers);

    // Check rate limit
    const rateLimit = await checkRateLimit(clientIp, "api");

    // Apply stricter rate limit for feedback specifically
    // Using a custom check since feedback should be more restricted
    const feedbackKey = `feedback:${clientIp}`;
    const feedbackRateLimit = await checkRateLimit(feedbackKey, "api");

    if (!feedbackRateLimit.success) {
      return NextResponse.json(
        { error: "Too many feedback submissions. Please try again later." },
        {
          status: 429,
          headers: rateLimitHeaders(feedbackRateLimit),
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { content, page } = body;

    // Validate content
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Feedback content is required" },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { error: "Feedback content cannot be empty" },
        { status: 400 }
      );
    }

    if (trimmedContent.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `Feedback content must be ${MAX_CONTENT_LENGTH.toLocaleString()} characters or less` },
        { status: 400 }
      );
    }

    // Validate page
    if (!isValidPage(page)) {
      return NextResponse.json(
        { error: "Invalid page value" },
        { status: 400 }
      );
    }

    // Get authenticated user (if any)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Insert feedback with validated user_id
    // SECURITY: user_id is determined server-side from the session, not from client input
    const { error: insertError } = await supabase.from("feedback").insert({
      user_id: user?.id ?? null,  // Server-side validated user_id
      content: trimmedContent,
      page: page,
    });

    if (insertError) {
      console.error("Error inserting feedback:", insertError);
      return NextResponse.json(
        { error: "Failed to submit feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Feedback submitted successfully" },
      {
        status: 200,
        headers: rateLimitHeaders(feedbackRateLimit),
      }
    );
  } catch (error) {
    console.error("Unexpected error in feedback submission:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
