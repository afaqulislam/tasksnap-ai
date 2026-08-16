"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import { GithubIcon } from "./brand-icons";
import { GITHUB_URL } from "@/lib/config";

export function Navbar() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/github-stars")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && typeof data?.stars === "number") {
          setStars(data.stars);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-40 border-b border-edge bg-background/80 backdrop-blur"
    >
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <a
          href="#top"
          className="flex items-center gap-2.5 text-sm font-semibold tracking-tight"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="size-3.5" aria-hidden />
          </span>
          <span>
            TaskSnap<span className="text-primary"> AI</span>
          </span>
        </a>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Star TaskSnap AI on GitHub"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-edge bg-card px-3 text-xs text-muted transition hover:border-primary/40 hover:text-foreground"
          >
            <GithubIcon className="size-4" />
            <Star className="size-3.5 text-primary" aria-hidden />
            {stars != null ? (
              <span className="min-w-4 rounded-full bg-surface px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-foreground">
                {stars}
              </span>
            ) : null}
          </a>
          <span className="hidden items-center gap-1.5 rounded-full border border-edge bg-card px-3 py-1 text-xs text-muted sm:inline-flex">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            AI-powered
          </span>
        </div>
      </nav>
    </motion.header>
  );
}
