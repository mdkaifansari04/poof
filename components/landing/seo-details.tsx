"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export const faqItems = [
  {
    question: "How does Poof link expiry work?",
    answer:
      "Each share link stores a fixed expiresAt timestamp. When someone opens a shared URL after that time, Poof returns an expired state and blocks access.",
  },
  {
    question: "Can I share only one image instead of a full gallery?",
    answer:
      "Yes. Poof supports three share types: full gallery, single image, and multi-image selection from the same gallery.",
  },
  {
    question: "Can I revoke a link before it expires?",
    answer:
      "Yes. Owners can revoke any active share link manually. Revoked links immediately become inaccessible and show a revoked state.",
  },
  {
    question: "What file types and sizes are supported?",
    answer:
      "Poof accepts image/jpeg, image/png, image/webp, and image/heic files up to 10 MB each. Validation runs on the server.",
  },
  {
    question: "What happens when I delete photos or galleries?",
    answer:
      "Deletions are soft-deleted immediately in the database and hidden from normal queries. Storage objects are permanently removed within 24 hours by cleanup jobs.",
  },
  {
    question: "Do recipients need an account to view shared links?",
    answer:
      "No. Shared pages are public URLs. Recipients can open them directly until the link expires or is revoked.",
  },
];

const limits = [
  ["Max file size", "10 MB per image"],
  ["Allowed MIME types", "JPEG · PNG · WEBP · HEIC"],
  ["Max galleries per user", "3"],
  ["Max images per gallery", "10"],
  ["Max images in multi-image link", "100"],
  ["Max active links per gallery", "20"],
  ["Expiry window", "1 hour to 1 year"],
  ["Presigned upload URL TTL", "5 minutes"],
];

const capabilities = [
  "Share full galleries, a single image, or a selected set of images.",
  "Create multiple independent links for the same gallery.",
  "Track per-link view count and expiry in your dashboard.",
  "Revoke links manually without deleting original content.",
  "Access shared links publicly with no recipient account required.",
];

const security = [
  "Authentication uses Better Auth with database-backed sessions.",
  "Upload URLs are presigned and expire quickly to reduce risk.",
  "Deleted galleries and images are removed from object storage within 24 hours.",
  "Pending uploads older than 30 minutes are marked failed automatically.",
  "Session cookies are httpOnly, secure, and SameSite=Lax.",
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/[0.06] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
        aria-expanded={open}
      >
        <span className="text-white font-medium text-[15px] pr-8 leading-snug group-hover:text-poof-violet transition-colors duration-200">
          {question}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-white/30 transition-transform duration-300 ease-out ${open ? "rotate-180 text-poof-violet" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${open ? "max-h-48 pb-5" : "max-h-0"}`}
      >
        <p className="text-sm text-white/50 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export function LandingSeoDetails() {
  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* ── Header ── */}
        <div className="max-w-2xl">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-[44px] text-white leading-[1.1] tracking-tight mb-5">
            Built for <span className="text-poof-violet">expiring</span> photo
            sharing at scale.
          </h2>
          <p className="text-white/50 text-base leading-relaxed">
            Poof combines direct-to-storage uploads, server-side ownership
            validation, and deterministic expiry rules so link behavior stays
            predictable for every shared gallery.
          </p>
        </div>

        {/* ── Capabilities + Security ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
          <div className="bg-[#0d0d0d] p-8 sm:p-10">
            <p className="text-[11px] tracking-[0.2em] uppercase text-white/25 font-medium mb-6">
              What Poof supports
            </p>
            <ul className="space-y-4">
              {capabilities.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-white/50 leading-relaxed"
                >
                  <span className="mt-[5px] shrink-0 w-1 h-1 rounded-full bg-poof-violet" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#0d0d0d] p-8 sm:p-10 lg:border-l-0 border-t border-t-white/[0.06] lg:border-t-0">
            <p className="text-[11px] tracking-[0.2em] uppercase text-white/25 font-medium mb-6">
              Security &amp; data lifecycle
            </p>
            <ul className="space-y-4">
              {security.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-white/50 leading-relaxed"
                >
                  <span className="mt-[5px] shrink-0 w-1 h-1 rounded-full bg-poof-mint" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div id="limits">
          <p className="text-[11px] tracking-[0.2em] uppercase text-white/25 font-medium mb-8">
            Platform limits · v1
          </p>

          <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
            {limits.map(([rule, value], i) => (
              <div
                key={rule}
                className={`grid grid-cols-2 sm:grid-cols-[1fr_auto] items-center px-6 py-4 gap-4
                  ${i % 2 === 0 ? "bg-white/[0.015]" : "bg-transparent"}
                  ${i !== limits.length - 1 ? "border-b border-white/[0.04]" : ""}`}
              >
                <span className="text-sm text-white/40">{rule}</span>
                <span className="text-sm text-white font-medium text-right sm:text-left tabular-nums">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <p className="text-white/25 text-xs mt-5 leading-relaxed">
            Need higher limits?{" "}
            <a
              href="mailto:poof-support@k04.tech"
              className="text-poof-violet hover:text-white transition-colors duration-150 underline underline-offset-2"
            >
              Contact support
            </a>{" "}
          </p>
        </div>

        {/* ── FAQ ── */}
        <div id="faq" className="gap-12 lg:gap-20">
          <div className="pb-10">
            <h3 className="font-heading font-bold text-2xl sm:text-3xl text-center text-white leading-tight tracking-tight">
              Frequently asked questions
            </h3>
          </div>

          <div className="w-full">
            <div className="w-[80%] mx-auto border p-6 px-8 rounded-xl border-white/[0.06]">
              {faqItems.map((item) => (
                <FaqItem key={item.question} {...item} />
              ))}
            </div>
            <p className="text-muted-foreground mt-6 px-8 text-sm text-center">
              Can't find what you're looking for? Contact our{" "}
              <Link
                href="mailto:poof-support@k04.tech"
                className="text-poof-violet font-medium hover:underline"
              >
                customer support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
