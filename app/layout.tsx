import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Hayai - RSVP Speed Reading App",
    template: "%s | Hayai",
  },
  description:
    "Read faster with Hayai. Our RSVP speed reading technology helps you read books, articles, and documents up to 3x faster. Upload PDFs, DOCX, or TXT files and start speed reading today.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hayai",
  },
  keywords: [
    "speed reading",
    "RSVP",
    "rapid serial visual presentation",
    "read faster",
    "reading app",
    "productivity",
    "speed reader",
    "PDF reader",
  ],
  authors: [{ name: "Hayai" }],
  creator: "Hayai",
  publisher: "Hayai",
  metadataBase: new URL("https://readhayai.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://readhayai.com",
    siteName: "Hayai",
    title: "Hayai - RSVP Speed Reading App",
    description:
      "Read faster with Hayai. Our RSVP speed reading technology helps you read books, articles, and documents up to 3x faster.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Hayai - Speed Reading App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hayai - RSVP Speed Reading App",
    description:
      "Read faster with Hayai. Our RSVP speed reading technology helps you read up to 3x faster.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: "your-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
