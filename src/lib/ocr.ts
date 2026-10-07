import type { Worker } from "tesseract.js";

const DEFAULT_LANG = "eng";
const MIN_TEXT_LENGTH = 40;
const MIN_ALPHA_RATIO = 0.3;

const configuredLangs =
  (process.env.NEXT_PUBLIC_OCR_LANGS?.trim() || DEFAULT_LANG)
    .split(",")
    .map((lang) => lang.trim())
    .filter(Boolean);

let workerPromise: Promise<Worker> | null = null;

async function createWorkerFor(langs: string[]): Promise<Worker> {
  const { createWorker } = await import("tesseract.js");
  return createWorker(langs, 1, { logger: () => {} });
}

function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = createWorkerFor(configuredLangs).catch((error: unknown) => {
      workerPromise = null;
      if (
        configuredLangs.length > 1 ||
        configuredLangs[0] !== DEFAULT_LANG
      ) {
        console.warn(
          `OCR: couldn't load configured languages (${configuredLangs.join(", ")}) — falling back to English.`,
          error,
        );
        return createWorkerFor([DEFAULT_LANG]).catch(() => {
          workerPromise = null;
          throw error;
        });
      }
      throw error;
    });
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

// \p{L} matches any letter in any script, so Urdu/Arabic/CJK screenshots
// clear the gate instead of being treated as OCR garbage.
const LETTER_PATTERN = /\p{L}/gu;

export function isMeaningfulOcrText(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < MIN_TEXT_LENGTH) return false;
  const letterCount = trimmed.match(LETTER_PATTERN)?.length ?? 0;
  return letterCount / trimmed.length >= MIN_ALPHA_RATIO;
}