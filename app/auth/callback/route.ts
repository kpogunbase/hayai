import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Handle OAuth errors from provider
  if (error) {
    console.error("[Auth Callback] OAuth error:", error, errorDescription);
    // Redirect to home with error indicator
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("auth_error", error);
    if (errorDescription) {
      redirectUrl.searchParams.set("auth_error_description", errorDescription);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // Validate that we have a code
  if (!code) {
    console.error("[Auth Callback] No code parameter received");
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("auth_error", "missing_code");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const supabase = createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[Auth Callback] Code exchange error:", exchangeError.message);
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("auth_error", "exchange_failed");
      return NextResponse.redirect(redirectUrl);
    }

    // Success - redirect to home page
    return NextResponse.redirect(new URL("/", request.url));
  } catch (err) {
    console.error("[Auth Callback] Unexpected error:", err);
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("auth_error", "unexpected_error");
    return NextResponse.redirect(redirectUrl);
  }
}
