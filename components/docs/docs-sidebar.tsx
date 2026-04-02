"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsNav } from "@/app/docs/_nav";
import { cn } from "@/lib/utils";

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {docsNav.map((section) => (
        <div key={section.title}>
          <p className="mb-1.5 text-xs font-medium text-poof-mist/60">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = !item.external && pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                    className={cn(
                      "block rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                      isActive
                        ? "bg-poof-violet/10 font-medium text-poof-violet"
                        : "text-poof-mist hover:text-white",
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
