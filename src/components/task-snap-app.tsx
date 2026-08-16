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
import { Footer } from "./footer";
import { parseAnalyzeResponse } from "@/lib/validate";
import type { Phase, Task } from "@/lib/types";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read the file"));
    reader.readAsDataURL(file);
  });
}

async function prepareImageDataUrl(file: File): Promise<string> {
  if (file.type !== "image/webp") {
    return readFileAsDataUrl(file);
  }
  const raw = await readFileAsDataUrl(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Unable to convert image"));
        return;
      }
      ctx.drawImage(image, 0, 0);
      resolve(canvas.toDataURL("image/png"));
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
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Please upload an image file.");
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
    setPhase("selected");
  }

  function handleBack() {
    setPhase("selected");
    scrollToUpload();
  }

  async function handleSubmit() {
    if (!file || !previewUrl) return;
    setPhase("processing");
    try {
      const dataUrl = await prepareImageDataUrl(file);
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      if (!response.ok) {
        throw new Error("Analysis failed");
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
    } catch {
      setPhase("error");
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

        <div ref={uploadRef} className="scroll-mt-20 px-4 sm:px-6">
          {phase === "idle" ? <EmptyState /> : null}

          {phase === "idle" || phase === "selected" ? (
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

          {phase === "error" ? (
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

          {phase === "processing" ? <ProcessingState /> : null}
        </div>

        <div ref={resultsRef} className="mt-6 scroll-mt-20 px-4 sm:px-6">
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
                    Demo mode — sample results shown because no AI provider key
                    is configured. Add an API key to analyze real screenshots.
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
      <Footer />
      </div>
    </MotionConfig>
  );
}
