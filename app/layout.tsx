import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { AppToaster } from "@/components/providers/app-toaster";
import { PwaRegister } from "@/components/providers/pwa-register";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://poof.k04.tech";
const appName = "Poof";
const appTitle = "Poof — Expiring Photo Sharing Links";
const appDescription =
  "Poof is a photo-sharing platform for expiring links. Share full galleries, single images, or selected photos with revocable links that automatically expire.";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  manifest: "/manifest.webmanifest",
  title: {
    default: appTitle,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  applicationName: appName,
  keywords: [
    "expiring photo links",
    "temporary photo sharing",
    "gallery sharing",
    "share photos privately",
    "revoke share links",
    "cloudflare r2 photo hosting",
    "photo sharing platform",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: appUrl,
    siteName: appName,
    title: appTitle,
    description: appDescription,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Poof expiring photo sharing platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: appTitle,
    description: appDescription,
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    shortcut: ["/icons/icon-192.png"],
  },
  appleWebApp: {
    capable: true,
    title: appName,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        suppressHydrationWarning
        className={`${dmSans.variable} ${syne.variable} font-sans antialiased bg-poof-base text-white`}
      >
        <QueryProvider>
          <PwaRegister />
          {children}
          <AppToaster />
        </QueryProvider>
      </body>
    </html>
  );
}
