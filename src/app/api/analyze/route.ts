import { NextResponse } from "next/server";
import {
  ApiError,
  demoTasks,
  extractTasksFromImage,
  hasAiConfiguration,
  isAllowedImageMime,
  isDemoMode,
} from "@/lib/ai";
import type { AnalyzeResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

interface AnalyzeBody {
  image?: string;
}

function parseBody(body: unknown): AnalyzeBody | null {
  if (typeof body !== "object" || body === null) return null;
  const record = body as Record<string, unknown>;
  return { image: typeof record.image === "string" ? record.image : undefined };
}

export async function POST(request: Request) {
  try {
    const payload = parseBody(await request.json());
    if (!payload || typeof payload.image !== "string" || !payload.image) {
      return NextResponse.json(
        { error: "No image provided" },
        { status: 400 },
      );
    }

    const dataUrl = payload.image;
    const match = /^data:([a-z0-9-]+\/[a-z0-9-]+);base64,([A-Za-z0-9+/=]+)$/i.exec(
      dataUrl,
    );

    if (!match) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 },
      );
    }

    const [, mime, base64] = match;
    if (!isAllowedImageMime(mime)) {
      return NextResponse.json(
        { error: "Unsupported image type" },
        { status: 400 },
      );
    }

    const byteLength = Math.floor((base64.length * 3) / 4);
    if (byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "Image too large" },
        { status: 413 },
      );
    }

    const useDemo = isDemoMode() && !hasAiConfiguration();
    const tasks = useDemo
      ? demoTasks()
      : await extractTasksFromImage(dataUrl);

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
