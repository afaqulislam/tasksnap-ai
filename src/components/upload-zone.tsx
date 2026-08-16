"use client";

import { useRef, useState, type DragEvent } from "react";
import { motion } from "framer-motion";
import { Camera, ImagePlus, RefreshCw, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Phase } from "@/lib/types";

interface UploadZoneProps {
  phase: Phase;
  previewUrl: string | null;
  error: string | null;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
  onSubmit: () => void;
  onRetry: () => void;
}

export function UploadZone({
  phase,
  previewUrl,
  error,
  onFileSelected,
  onRemove,
  onSubmit,
  onRetry,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function openPicker() {
    inputRef.current?.click();
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFileSelected(file);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        aria-label="Upload a screenshot"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {phase === "error" ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mx-auto w-full max-w-2xl rounded-2xl border border-danger/25 bg-card p-8 text-center sm:p-10"
        >
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <RefreshCw className="size-5" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold">
            We couldn&apos;t analyze this screenshot.
          </h2>
          <p className="mt-2 text-sm text-muted">{error ?? "Please try again."}</p>
          <motion.button
            type="button"
            onClick={onRetry}
            whileTap={{ scale: 0.97 }}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-on-primary transition hover:bg-primary-strong"
          >
            <RefreshCw className="size-4" aria-hidden />
            Try Again
          </motion.button>
        </motion.div>
      ) : previewUrl ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mx-auto w-full max-w-2xl"
        >
          {error ? (
            <p
              role="alert"
              className="mb-3 animate-fade-in rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-center text-sm text-danger"
            >
              {error}
            </p>
          ) : null}
          <div className="rounded-2xl border border-edge bg-card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-success">
                <span className="flex size-5 items-center justify-center rounded-full bg-success/15">
                  <span aria-hidden>✓</span>
                </span>
                Screenshot ready
              </p>
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface px-3 py-1.5 text-xs text-muted transition hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden />
                Remove
              </button>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-edge bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Uploaded screenshot preview"
                className="mx-auto max-h-80 w-full object-contain"
              />
              <div
                aria-hidden
                className="animate-scan pointer-events-none absolute inset-x-0 h-px bg-primary/70"
              />
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <motion.button
                type="button"
                onClick={onSubmit}
                whileTap={{ scale: 0.97 }}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-on-primary transition hover:bg-primary-strong sm:w-auto sm:flex-1"
              >
                <Sparkles className="size-4" aria-hidden />
                Extract Tasks
              </motion.button>
              <motion.button
                type="button"
                onClick={openPicker}
                whileTap={{ scale: 0.97 }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-edge bg-surface px-5 text-sm font-medium text-muted transition hover:text-foreground"
              >
                <ImagePlus className="size-4" aria-hidden />
                Reselect
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="mx-auto w-full max-w-2xl">
          {error ? (
            <p
              role="alert"
              className="mb-3 animate-fade-in rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-center text-sm text-danger"
            >
              {error}
            </p>
          ) : null}
          <motion.button
            type="button"
            onClick={openPicker}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            animate={{ scale: isDragging ? 1.015 : 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "group flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed bg-surface px-6 py-12 transition-colors sm:py-16",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-edge hover:border-primary/50 hover:bg-primary/[0.03]",
            )}
          >
            <motion.span
              animate={isDragging ? { scale: 1.08, rotate: -4 } : { scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={cn(
                "flex size-14 items-center justify-center rounded-2xl border border-edge bg-card transition-colors",
                isDragging && "border-primary/40 text-primary",
              )}
            >
              <Camera
                className={cn(
                  "size-6 transition-colors",
                  isDragging ? "text-primary" : "text-muted",
                )}
                aria-hidden
              />
            </motion.span>
            <span className="text-lg font-semibold">
              Drop your screenshot here
            </span>
            <span className="text-sm text-muted">or click to browse</span>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-edge bg-card px-3 py-1 text-xs text-muted">
              PNG, JPG, JPEG or WEBP
              <span className="size-1 rounded-full bg-primary" aria-hidden />
              up to 8MB
            </span>
          </motion.button>
        </div>
      )}
    </>
  );
}
