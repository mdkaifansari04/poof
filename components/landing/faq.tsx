"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { faqItems } from "@/lib/faq-data";

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-6 text-left group gap-6"
        aria-expanded={open}
      >
        <span className="text-foreground font-medium text-[15px] leading-snug group-hover:text-poof-violet transition-colors duration-200">
          {question}
        </span>
        <ChevronDown
          size={18}
          strokeWidth={1.5}
          className={`shrink-0 text-foreground/25 transition-transform duration-300 ease-out ${
            open ? "rotate-180 text-poof-violet" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          open ? "max-h-48 pb-6" : "max-h-0"
        }`}
      >
        <p className="text-muted-foreground text-sm leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function LandingFaq() {
  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="font-heading font-extrabold text-4xl sm:text-5xl text-foreground leading-[1.05] tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground text-base">
            Everything you need to know about Poof.
          </p>
        </div>

        <div className="animate-fade-up stagger-2">
          <div className="rounded-2xl border border-border bg-card p-1 px-6 sm:px-8">
            {faqItems.map((item) => (
              <FaqItem key={item.question} {...item} />
            ))}
          </div>
        </div>

        <p className="text-muted-foreground mt-8 text-sm text-center animate-fade-up stagger-3">
          Can&apos;t find what you&apos;re looking for? Contact our{" "}
          <Link
            href="mailto:poof-support@k04.tech"
            className="text-poof-violet font-medium hover:underline"
          >
            customer support team
          </Link>
        </p>
      </div>
    </section>
  );
}
