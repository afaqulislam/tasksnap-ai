"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { LinkedinIcon, XIcon } from "./brand-icons";

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

export function Footer() {
  const [year, setYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setYear(new Date().getFullYear());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <footer className="mt-auto border-t border-edge">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6">
        <p className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="size-3.5" aria-hidden />
          </span>
          <span>
            TaskSnap<span className="text-primary"> AI</span>
          </span>
        </p>
        <p className="text-sm text-muted">Built for Chai aur Code</p>
        <div className="flex items-center gap-3">
          {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="inline-flex size-10 items-center justify-center rounded-full border border-edge bg-card text-muted transition hover:border-primary/40 hover:text-primary"
            >
              <Icon className="size-4" />
            </a>
          ))}
        </div>
        <p className="text-xs text-muted/70">
          © {year} TaskSnap AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
