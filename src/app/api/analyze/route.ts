import { NextResponse } from "next/server";
import {
  ApiError,
  demoTasks,
  extractTasksFromInput,
  hasAiConfiguration,
  isAllowedImageMime,
  isDemoMode,
} from "@/lib/ai";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { AnalyzeResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_TEXT_LENGTH = 12000;

interface AnalyzeBody {
  text?: string;
  image?: string;
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
  const match = /^data:([a-z0-9-]+\/[a-z0-9-]+);base64,([A-Za-z0-9+/=]+)$/i.exec(
    dataUrl,
  );
  if (!match) return "Invalid image format";

  const [, mime, base64] = match;
  if (!isAllowedImageMime(mime)) return "Unsupported image type";

  const byteLength = Math.floor((base64.length * 3) / 4);
  if (byteLength > MAX_IMAGE_BYTES) return "Image too large";
  return null;
}

export async function POST(request: Request) {
  let payload: AnalyzeBody | null;
  try {
    payload = parseBody(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    !payload ||
    (typeof payload.text !== "string" && typeof payload.image !== "string")
  ) {
    return NextResponse.json({ error: "No content provided" }, { status: 400 });
  }

  let image: string | undefined;
  if (typeof payload.image === "string" && payload.image) {
    const imageError = imageValidationError(payload.image);
    if (imageError) {
      return NextResponse.json({ error: imageError }, { status: 400 });
    }
    image = payload.image;
  }

  const text =
    typeof payload.text === "string"
      ? payload.text.trim().slice(0, MAX_TEXT_LENGTH)
      : undefined;

  if (!text && !image) {
    return NextResponse.json({ error: "No content provided" }, { status: 400 });
  }

  const useDemo = isDemoMode() && !hasAiConfiguration();
  if (!useDemo) {
    const rateLimit = checkRateLimit(getClientIp(request));
    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes and try again." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        },
      );
    }
  }

  try {
    const tasks = useDemo
      ? demoTasks()
      : await extractTasksFromInput({ text, image });

    const response: AnalyzeResponse = { tasks, demo: useDemo };
    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Analyze failed:", error);
    return NextResponse.json(
      { error: "Unable to analyze the screenshot" },
      { status: 500 },
    );
  }
}