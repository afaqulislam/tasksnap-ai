import { NextResponse } from "next/server";
import { GITHUB_REPO } from "@/lib/config";

const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}`;

export const revalidate = 3600;

export async function GET() {
  try {
    const response = await fetch(GITHUB_API, {
      headers: { "User-Agent": "tasksnap-ai", Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return NextResponse.json({ stars: null }, { status: 502 });
    }
    const data: unknown = await response.json();
    const stars =
      typeof data === "object" &&
      data !== null &&
      typeof (data as Record<string, unknown>).stargazers_count === "number"
        ? (data as Record<string, unknown>).stargazers_count
        : null;
    return NextResponse.json({ stars });
  } catch {
    return NextResponse.json({ stars: null }, { status: 502 });
  }
}
