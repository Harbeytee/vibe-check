import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppProviders from "./app-providers";
import { GoogleAnalytics } from "@next/third-parties/google";
import config from "./lib/config";
import { ProcessEnv } from "./types/enums";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vybecheck.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Vybe Check — Fun Questions, Real Connections",
    template: "%s | Vybe Check",
  },
  description:
    "A multiplayer card game that brings people together. Create rooms, invite friends, and take turns answering fun questions from themed packs. Play with friends, family, or partners.",
  keywords: [
    "party game",
    "icebreaker",
    "questions game",
    "multiplayer game",
    "friends game",
    "family game",
    "card game",
    "conversation game",
    "Vybe Check",
  ],
  authors: [{ name: "Abiodun Tijani" }],
  creator: "Abiodun Tijani",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Vybe Check",
    title: "Vybe Check — Fun Questions, Real Connections",
    description:
      "A multiplayer card game that brings people together. Create rooms, invite friends, and take turns answering fun questions.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Vybe Check — Fun questions, real connections",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vybe Check — Fun Questions, Real Connections",
    description:
      "A multiplayer card game that brings people together. Create rooms, invite friends, and take turns answering fun questions.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {config.environment === ProcessEnv.PRODUCTION && (
          <GoogleAnalytics gaId={config.googleAnalyticsId || ""} />
        )}

        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
