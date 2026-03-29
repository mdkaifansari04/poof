import type { Metadata } from "next";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingHowItWorks } from "@/components/landing/how-it-works";
import { LandingPricing } from "@/components/landing/pricing";
import { LandingFooter } from "@/components/landing/footer";
import { LandingNav } from "@/components/landing/nav";
import { LandingSeoDetails, faqItems } from "@/components/landing/seo-details";
import Features from "@/components/landing/feature-2";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://poof.k04.tech";
const pageTitle =
  "Poof | Expiring Photo Sharing Links for Galleries and Images";
const pageDescription =
  "Poof lets you upload photos, organize galleries, and generate expiring share links for full galleries, single images, or custom selections.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/",
  },
  keywords: [
    "expiring photo links",
    "temporary photo sharing",
    "gallery sharing links",
    "share single image link",
    "multi image sharing",
    "revocable share links",
    "secure photo sharing app",
  ],
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: appUrl,
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Poof expiring photo sharing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/twitter-image"],
  },
};

export default function LandingPage() {
  const softwareAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Poof",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    url: appUrl,
    description: pageDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Expiring share links",
      "Gallery sharing",
      "Single-image sharing",
      "Multi-image sharing",
      "Manual link revocation",
      "Public share pages without recipient sign-in",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Poof",
    url: appUrl,
    description: pageDescription,
  };

  // const faqJsonLd = {
  //   "@context": "https://schema.org",
  //   "@type": "FAQPage",
  //   mainEntity: faqItems.map((faq) => ({
  //     "@type": "Question",
  //     name: faq.question,
  //     acceptedAnswer: {
  //       "@type": "Answer",
  //       text: faq.answer,
  //     },
  //   })),
  // };

  return (
    <div className="min-h-screen bg-poof-base">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        // dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <LandingNav />
      <main>
        <LandingHero />
        <Features />
        <LandingHowItWorks />
        {/* <LandingPricing /> */}
        <LandingSeoDetails />
      </main>
      <LandingFooter />
    </div>
  );
}
