import { NextResponse } from "next/server";
import {
  ApiError,
  demoTasks,
  extractTasksFromInput,
  hasAiConfiguration,
  isAllowedImageMime,
  isDemoMode,
  UNAVAILABLE_MESSAGE,
} from "@/lib/ai";
import { checkRateLimit, getClientIp, refundRateLimit } from "@/lib/rate-limit";
import { MAX_IMAGE_BYTES, MAX_REQUEST_BYTES, MAX_TEXT_LENGTH } from "@/lib/config";
import type { AnalyzeResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface AnalyzeBody {
  text?: string;
  image?: string;
}

/**
 * Reads and parses the JSON body with a hard byte cap. Route handlers have
 * no built-in body limit, so the 8 MB image rule is enforced *before* the
 * payload is materialized instead of after.
 */
async function readJsonBody(request: Request): Promise<unknown> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_REQUEST_BYTES) {
    throw new PayloadTooLarge();
  }

  const reader = request.body?.getReader();
  if (!reader) return null;

  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_REQUEST_BYTES) {
      await reader.cancel().catch(() => {});
      throw new PayloadTooLarge();
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(merged));
}

class PayloadTooLarge extends Error {
  constructor() {
    super("Request too large");
    this.name = "PayloadTooLarge";
  }
}

function parseBody(body: unknown): AnalyzeBody | null {
  if (typeof body !== "object" || body === null) return null;
  const record = body as Record<string, unknown>;
  return {
    text: typeof record.text === "string" ? record.text : undefined,
    image: typeof record.image === "string" ? record.image : undefined,
  };
}

function imageValidationError(dataUrl: string): string | null {
  const match =
    /^data:([a-z0-9-]+\/[a-z0-9-]+);base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl);
  if (!match) return "Invalid image format";

  const [, mime, base64] = match;
  if (!isAllowedImageMime(mime)) return "Unsupported image type";

  const byteLength = Math.floor((base64.length * 3) / 4);
  if (byteLength > MAX_IMAGE_BYTES) return "Image too large";
  return null;
}

function errorResponse(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: message }, { status, headers });
}

export async function POST(request: Request) {
  let payload: AnalyzeBody | null;
  try {
    payload = parseBody(await readJsonBody(request));
  } catch (error) {
    if (error instanceof PayloadTooLarge) {
      return errorResponse("Request too large", 413);
    }
    return errorResponse("Invalid JSON body", 400);
  }

  if (
    !payload ||
    (typeof payload.text !== "string" && typeof payload.image !== "string")
  ) {
    return errorResponse("No content provided", 400);
  }

  let image: string | undefined;
  if (typeof payload.image === "string" && payload.image) {
    const imageError = imageValidationError(payload.image);
    if (imageError) return errorResponse(imageError, 400);
    image = payload.image;
  }

  const text =
    typeof payload.text === "string"
      ? payload.text.trim().slice(0, MAX_TEXT_LENGTH)
      : undefined;

  if (!text && !image) return errorResponse("No content provided", 400);

  const demo = isDemoMode() && !hasAiConfiguration();
  if (!demo && !hasAiConfiguration()) {
    console.warn(
      "Analyze: no AI provider configured — set GROQ_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY, or enable DEMO_MODE.",
    );
    return errorResponse(UNAVAILABLE_MESSAGE, 503);
  }

  const ip = getClientIp(request);
  if (!demo) {
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.ok) {
      const { retryAfterSeconds } = rateLimit;
      const unit = retryAfterSeconds === 1 ? "second" : "seconds";
      return errorResponse(
        `Too many requests. Please wait ${retryAfterSeconds} ${unit} and try again.`,
        429,
        { "Retry-After": String(retryAfterSeconds) },
      );
    }
  }

  try {
    const tasks = demo ? demoTasks() : await extractTasksFromInput({ text, image });
    const response: AnalyzeResponse = { tasks, demo };
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status >= 500 && !demo) refundRateLimit(ip);
      return errorResponse(error.message, error.status);
    }
    console.error("Analyze failed:", error);
    if (!demo) refundRateLimit(ip);
    return errorResponse("Unable to analyze the screenshot", 500);
  }
}
