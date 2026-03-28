import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { Toaster } from "sonner";
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
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "rgba(255, 255, 255, 0.04)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#fff",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
