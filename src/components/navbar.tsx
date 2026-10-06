"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Sparkles, Star, X } from "lucide-react";
import { GithubIcon } from "./brand-icons";
import { GITHUB_URL } from "@/lib/config";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#comparison", label: "Why TaskSnap" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [stars, setStars] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pendingHash = useRef<string | null>(null);

  function scrollToHash(hash: string) {
    const target = document.querySelector(hash);
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }

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

  useEffect(() => {
    if (!isMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && !headerRef.current?.contains(target)) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePress);
    };
  }, [isMenuOpen]);

  function handleNavClick(
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    if (window.location.hash !== href) {
      window.history.replaceState(null, "", href);
    }

    // Closing the menu animates its panel, which cancels a smooth scroll
    // started in the same frame — so scroll once that exit has finished.
    if (isMenuOpen) {
      pendingHash.current = href;
      setIsMenuOpen(false);
      window.setTimeout(() => {
        if (pendingHash.current !== href) return;
        pendingHash.current = null;
        scrollToHash(href);
      }, 600);
      return;
    }
    scrollToHash(href);
  }

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-40 border-b border-edge bg-background/85 backdrop-blur"
    >
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <a
          href="#top"
          onClick={(event) => handleNavClick(event, "#top")}
          className="flex shrink-0 items-center gap-2.5 text-sm font-semibold tracking-tight"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="size-3.5" aria-hidden />
          </span>
          <span>
            TaskSnap<span className="text-primary"> AI</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={(event) => handleNavClick(event, href)}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-card hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
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
          <a
            href="#upload"
            onClick={(event) => handleNavClick(event, "#upload")}
            className="hidden h-9 items-center rounded-full bg-primary px-4 text-xs font-semibold text-on-primary transition hover:bg-primary-strong sm:inline-flex"
          >
            Try it free
          </a>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="inline-flex size-9 items-center justify-center rounded-full border border-edge bg-card text-muted transition hover:text-foreground md:hidden"
          >
            {isMenuOpen ? (
              <X className="size-4" aria-hidden />
            ) : (
              <Menu className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence
        initial={false}
        onExitComplete={() => {
          const hash = pendingHash.current;
          if (!hash) return;
          pendingHash.current = null;
          scrollToHash(hash);
        }}
      >
        {isMenuOpen ? (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute inset-x-0 top-full overflow-hidden border-b border-edge bg-background shadow-xl md:hidden"
          >
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-3 sm:px-6">
              {NAV_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={(event) => handleNavClick(event, href)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-card hover:text-foreground"
                >
                  {label}
                </a>
              ))}
              <a
                href="#upload"
                onClick={(event) => handleNavClick(event, "#upload")}
                className="mt-1 inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-on-primary transition hover:bg-primary-strong"
              >
                Try it free
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}