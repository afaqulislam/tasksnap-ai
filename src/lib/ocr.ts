import type { Worker } from "tesseract.js";

const DEFAULT_LANG = "eng";

const configuredLangs =
  (process.env.NEXT_PUBLIC_OCR_LANGS?.trim() || DEFAULT_LANG)
    .split(",")
    .map((lang) => lang.trim())
    .filter(Boolean);

let workerPromise: Promise<Worker> | null = null;

function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import("tesseract.js");
      return createWorker(configuredLangs, 1, { logger: () => {} });
    })();
  }
  return workerPromise;
}

function normalizeText(text: string): string {
  return text.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
}

export async function extractTextFromImage(
  dataUrl: string,
): Promise<string> {
  const worker = await getWorker();
  const { data } = await worker.recognize(dataUrl);
  return normalizeText(data.text ?? "");
}