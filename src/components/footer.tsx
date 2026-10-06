"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { LinkedinIcon, XIcon } from "./brand-icons";
import { GITHUB_URL } from "@/lib/config";

const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/afaqulislam",
    Icon: LinkedinIcon,
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/afaqulislam708",
    Icon: XIcon,
  },
];

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Features", href: "#features" },
      { label: "Use cases", href: "#use-cases" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Open source",
    links: [
      { label: "Repository", href: GITHUB_URL },
      { label: "Report an issue", href: `${GITHUB_URL}/issues` },
      { label: "Getting started", href: `${GITHUB_URL}#-getting-started` },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "MIT License", href: `${GITHUB_URL}/blob/main/LICENSE` },
      { label: "Privacy", href: "#faq-data" },
      { label: "Usage limits", href: "#faq-limits" },
    ],
  },
];

export function Footer() {
  const [year] = useState(() => new Date().getFullYear());

  return (
    <footer className="mt-auto border-t border-edge">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <p className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Sparkles className="size-3.5" aria-hidden />
              </span>
              <span>
                TaskSnap<span className="text-primary"> AI</span>
              </span>
            </p>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              Turn screenshots of chats, emails, and announcements into a
              prioritized task list — with OCR that runs on your device.
            </p>
            <div className="mt-1 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-edge bg-card text-muted transition hover:border-primary/40 hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_LINKS.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <h2 className="font-mono-label text-muted">{column.title}</h2>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...(link.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="text-sm text-muted transition hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-edge pt-6 text-xs text-muted/70 sm:flex-row">
          <p>
            © {year} TaskSnap AI. All rights reserved.
          </p>
          <p>Free &amp; open source under the MIT License</p>
        </div>
      </div>
    </footer>
  );
}