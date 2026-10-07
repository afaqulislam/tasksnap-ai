"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowLeft, ImagePlus, PartyPopper } from "lucide-react";
import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { UploadZone } from "./upload-zone";
import { ProcessingState } from "./processing-state";
import { EmptyState } from "./empty-state";
import { NoTasksFound } from "./no-tasks-found";
import { UrgencyRadar } from "./urgency-radar";
import { WhatShouldIDo } from "./what-should-i-do";
import { TaskList } from "./task-list";
import { HowItWorks } from "./how-it-works";
import { Features } from "./features";
import { UseCases } from "./use-cases";
import { Comparison } from "./comparison";
import { Faq } from "./faq";
import { CtaBanner } from "./cta-banner";
import { Footer } from "./footer";
import { parseAnalyzeResponse } from "@/lib/validate";
import {
  ALLOWED_IMAGE_MIME,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_DIMENSION,
} from "@/lib/config";
import type { Phase, Task } from "@/lib/types";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read the file"));
    reader.readAsDataURL(file);
  });
}

const OCR_TIMEOUT_MS = 45_000;
const FETCH_TIMEOUT_MS = 70_000;

class CancelledError extends Error {
  constructor() {
    super("Cancelled");
    this.name = "CancelledError";
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("OCR timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function prepareImageDataUrl(file: File): Promise<string> {
  const raw = await readFileAsDataUrl(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      if (
        width <= MAX_IMAGE_DIMENSION &&
        height <= MAX_IMAGE_DIMENSION &&
        file.type !== "image/webp"
      ) {
        resolve(raw);
        return;
      }
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const ctx = canvas.getContext("2d");
      const fail = () =>
        reject(
          new Error("Unable to process this image. Please try a different screenshot."),
        );
      if (!ctx) {
        fail();
        return;
      }
      try {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        // Oversized/corrupt pixels can make canvas rendering throw; a
        // rejected promise keeps the UI out of the processing phase for good.
        fail();
      }
    };
    image.onerror = () => reject(new Error("Unable to read image"));
    image.src = raw;
  });
}

export function TaskSnapApp() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const uploadRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const isSubmittingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const cancelRejectRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function resetResults() {
    setTasks([]);
    setCompleted(new Set());
    setIsDemo(false);
  }

  function handleFileSelected(selected: File) {
    if (!ALLOWED_IMAGE_MIME.includes(selected.type as (typeof ALLOWED_IMAGE_MIME)[number])) {
      setError("Please upload an image file.");
      return;
    }
    if (selected.size === 0) {
      setError("This file is empty. Please choose a valid screenshot.");
      return;
    }
    if (selected.size > MAX_IMAGE_BYTES) {
      setError("This image is too large. Please choose a smaller screenshot.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    setFile(selected);
    setError(null);
    resetResults();
    setPhase("selected");
  }

  function handleRemove() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    setError(null);
    resetResults();
    setPhase("idle");
  }

  function handleReset() {
    handleRemove();
    scrollToUpload();
  }

  function handleRetry() {
    setError(null);
    setPhase("selected");
  }

  function handleBack() {
    setError(null);
    setPhase("selected");
    scrollToUpload();
  }

  function handleCancel() {
    if (!isSubmittingRef.current) return;
    cancelRejectRef.current?.();
    abortRef.current?.abort();
  }

  async function handleSubmit() {
    if (!file || !previewUrl || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setPhase("processing");
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;
    let triggerCancel = () => {};
    const cancelled = new Promise<never>((_, reject) => {
      triggerCancel = () => reject(new CancelledError());
    });
    cancelled.catch(() => {});
    cancelRejectRef.current = triggerCancel;
    let fetchTimeout: ReturnType<typeof setTimeout> | undefined;

    try {
      const dataUrl = await prepareImageDataUrl(file);
      let text = "";
      try {
        const { extractTextFromImage, isMeaningfulOcrText } = await import(
          "@/lib/ocr"
        );
        const extracted = await Promise.race([
          withTimeout(extractTextFromImage(dataUrl), OCR_TIMEOUT_MS),
          cancelled,
        ]);
        if (isMeaningfulOcrText(extracted)) text = extracted.trim();
      } catch (ocrError) {
        if (ocrError instanceof CancelledError) throw ocrError;
        // OCR failed or timed out; fall back to the image path
      }
      // Only the extracted text travels when OCR succeeded; the image is
      // uploaded solely as the fallback for screenshots OCR cannot read.
      const body: Record<string, unknown> = text
        ? { text }
        : { image: dataUrl };
      fetchTimeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const response = await Promise.race([
        fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        }),
        cancelled,
      ]);
      // Stop the timeout before reading the body so a slow read isn't
      // mistaken for a timeout after the response already arrived.
      clearTimeout(fetchTimeout);
      if (!response.ok) {
        let message = "Analysis failed. Please try again.";
        try {
          const body: unknown = await response.json();
          const err =
            typeof body === "object" && body !== null
              ? (body as Record<string, unknown>).error
              : undefined;
          if (typeof err === "string" && err.length > 0) message = err;
        } catch {
          // fall back to the default message
        }
        throw new Error(message);
      }
      const json: unknown = await response.json();
      const extracted = parseAnalyzeResponse(json);
      const demo =
        typeof json === "object" &&
        json !== null &&
        (json as Record<string, unknown>).demo === true;
      setTasks(extracted);
      setIsDemo(demo);
      setPhase("done");
    } catch (error) {
      if (error instanceof CancelledError) {
        setPhase("selected");
        setError(null);
      } else if (controller.signal.aborted) {
        setError("Analysis timed out. Please try again.");
        setPhase("error");
      } else if (error instanceof TypeError) {
        setError("Network error. Please check your connection and try again.");
        setPhase("error");
      } else {
        setError(
          error instanceof Error && error.message.length > 0
            ? error.message
            : "Unable to analyze the screenshot",
        );
        setPhase("error");
      }
    } finally {
      clearTimeout(fetchTimeout);
      abortRef.current = null;
      cancelRejectRef.current = null;
      isSubmittingRef.current = false;
    }
  }

  function toggleComplete(index: number) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  useEffect(() => {
    if (phase === "done") {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [phase]);

  function scrollToUpload() {
    uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <MotionConfig reducedMotion="user">
      <div id="top" className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
        <Hero onUploadClick={scrollToUpload} />

        <div id="upload" ref={uploadRef} className="scroll-mt-28 px-4 sm:px-6">
          {phase === "idle" ? <EmptyState /> : null}

          {phase === "idle" ||
          phase === "selected" ||
          phase === "error" ? (
            <UploadZone
              phase={phase}
              previewUrl={previewUrl}
              error={error}
              onFileSelected={handleFileSelected}
              onRemove={handleRemove}
              onSubmit={handleSubmit}
              onRetry={handleRetry}
            />
          ) : null}

          {phase === "processing" ? <ProcessingState onCancel={handleCancel} /> : null}
        </div>

        <div ref={resultsRef} className="mt-6 scroll-mt-28 px-4 sm:px-6">
          {phase === "done" && tasks.length === 0 ? (
            <NoTasksFound onReset={handleReset} />
          ) : null}

          {phase === "done" && tasks.length > 0 ? (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mx-auto flex w-full max-w-2xl flex-col gap-6"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Your Tasks
                  </h2>
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-muted">
                  AI extracted these actionable items from your screenshot.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-edge"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={tasks.length}
                    aria-valuenow={completed.size}
                    aria-label="Tasks completed"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(completed.size / tasks.length) * 100}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="h-full rounded-full bg-success"
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted">
                    {completed.size} of {tasks.length} done
                  </span>
                </div>
                <AnimatePresence>
                  {completed.size > 0 && completed.size === tasks.length ? (
                    <motion.p
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className="mt-3 inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3.5 py-1.5 text-xs font-semibold text-success"
                    >
                      <PartyPopper className="size-3.5" aria-hidden />
                      All tasks complete — nice work!
                    </motion.p>
                  ) : null}
                </AnimatePresence>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <motion.button
                    type="button"
                    onClick={handleBack}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-edge bg-card px-4 text-sm font-medium text-muted transition hover:text-foreground"
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                    Back
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleReset}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-edge bg-card px-4 text-sm font-medium text-muted transition hover:text-foreground"
                  >
                    <ImagePlus className="size-4" aria-hidden />
                    Upload Another Screenshot
                  </motion.button>
                </div>
                {isDemo ? (
                  <p className="mt-3 rounded-xl border border-warning/25 bg-warning/5 px-4 py-2.5 text-xs leading-relaxed text-warning">
                    Sample results — AI analysis isn&apos;t connected on this
                    deployment yet, so these are example tasks rather than your
                    screenshot.
                  </p>
                ) : null}
              </div>

              <UrgencyRadar tasks={tasks} completed={completed} />
              <WhatShouldIDo tasks={tasks} completed={completed} />
              <TaskList
                tasks={tasks}
                completed={completed}
                onToggle={toggleComplete}
              />
            </motion.section>
          ) : null}
        </div>
      </main>
      <HowItWorks />
      <Features />
      <UseCases />
      <Comparison />
      <Faq />
      <CtaBanner onUploadClick={scrollToUpload} />
      <Footer />
      </div>
    </MotionConfig>
  );
}
