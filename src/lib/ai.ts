import type { Task } from "./types";
import { parseAnalyzeResponse } from "./validate";

const SYSTEM_PROMPT = `You are TaskSnap AI, an intelligent task extraction assistant.

Analyze the provided screenshot carefully.

Identify every actionable task, assignment, event, responsibility, deadline, reminder, or action item that a person should remember or complete.

For every task extract:

1. title
2. description
3. deadline
4. priority
5. assignee

Rules:

- Only extract actionable information.
- Do not invent information.
- If a deadline is not explicitly available, return null.
- If an assignee is not explicitly available, return null.
- If priority is explicitly stated, preserve it.
- If priority is not explicitly stated, infer it conservatively from urgency and importance.
- Keep titles short.
- Keep descriptions concise.
- Preserve important context.
- Do not create tasks from ordinary conversational text unless there is an actionable requirement.
- Return valid JSON only.
- Do not return markdown.
- Do not explain reasoning.

Return exactly:

{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "deadline": "string or null",
      "priority": "high | medium | low",
      "assignee": "string or null"
    }
  ]
}`;

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function extractErrorMessage(body: string): string | null {
  try {
    const data: unknown = JSON.parse(body);
    if (typeof data === "object" && data !== null) {
      const message = (data as Record<string, unknown>).error as
        | Record<string, unknown>
        | undefined;
      if (typeof message?.message === "string" && message.message.length > 0) {
        return message.message;
      }
    }
  } catch {
    // ignore malformed bodies
  }
  return null;
}

function parseRetryAfter(response: Response, body: string): number | null {
  const header = response.headers.get("Retry-After");
  if (header) {
    const seconds = Number(header);
    if (Number.isFinite(seconds)) return seconds;
  }
  const match = body.match(/try again in ([\d.]+)s/i);
  if (match) {
    const seconds = Number(match[1]);
    if (Number.isFinite(seconds)) return seconds;
  }
  return null;
}

export function isAllowedImageMime(mime: string): boolean {
  return ALLOWED_MIME.has(mime.toLowerCase());
}

function getGroqKey(): string | null {
  return process.env.GROQ_API_KEY?.trim() || null;
}

function getGeminiKey(): string | null {
  return process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() || null;
}

export function hasAiConfiguration(): boolean {
  return Boolean(getGroqKey() || getGeminiKey());
}

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

function extractJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      try {
        return JSON.parse(fenced[1]);
      } catch {
        return null;
      }
    }
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function analyzeWithGroq(dataUrl: string): Promise<Task[]> {
  const apiKey = getGroqKey();
  if (!apiKey) throw new Error("Missing Groq API key");

  const model = process.env.AI_MODEL?.trim() || "qwen/qwen3.6-27b";

  const body: Record<string, unknown> = {
    model,
    temperature: 0,
    max_tokens: 1200,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: dataUrl },
          },
          {
            type: "text",
            text: "Extract the actionable tasks from this screenshot. Return JSON only.",
          },
        ],
      },
    ],
  };
  if (model.toLowerCase().includes("qwen")) {
    body.reasoning_effort = "none";
  }

  async function call(attempt: number): Promise<Task[]> {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (response.status === 429 && attempt < 2) {
      const bodyText = await response.text().catch(() => "");
      const retryAfter = parseRetryAfter(response, bodyText);
      if (retryAfter !== null && retryAfter <= 5) {
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
        return call(attempt + 1);
      }
      throw new ApiError(
        extractErrorMessage(bodyText) ??
          "AI is rate-limited. Wait a moment and try again.",
        429,
      );
    }

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      console.error(`Groq API ${response.status}: ${bodyText.slice(0, 500)}`);
      throw new Error(`AI provider returned ${response.status}`);
    }

    const data = await response.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    return parseAnalyzeResponse(extractJson(content));
  }

  return call(1);
}

async function analyzeWithGemini(dataUrl: string): Promise<Task[]> {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error("Missing Gemini API key");

  const model = process.env.AI_MODEL?.trim() || "gemini-2.0-flash";
  const mime = dataUrl.split(";")[0].split(":")[1] || "image/png";
  const base64 = dataUrl.split(",")[1] || "";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0,
        },
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: mime, data: base64 } },
              { text: "Extract the actionable tasks from this screenshot." },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`AI provider returned ${response.status}`);
  }

  const data = await response.json();
  const content: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return parseAnalyzeResponse(extractJson(content));
}

export async function extractTasksFromImage(dataUrl: string): Promise<Task[]> {
  if (getGroqKey()) {
    return analyzeWithGroq(dataUrl);
  }
  if (getGeminiKey()) {
    return analyzeWithGemini(dataUrl);
  }
  throw new Error("No AI provider configured");
}

export function demoTasks(): Task[] {
  return [
    {
      title: "CN Assignment",
      description: "Submit the Computer Networks assignment.",
      deadline: "Monday",
      priority: "high",
      assignee: null,
    },
    {
      title: "AI Presentation",
      description: "Present the AI project on Wednesday.",
      deadline: "Wednesday",
      priority: "medium",
      assignee: null,
    },
    {
      title: "Prepare Presentation Slides",
      description: "Prepare the slides for the AI presentation.",
      deadline: null,
      priority: "medium",
      assignee: "Afaq",
    },
    {
      title: "Complete Research Report",
      description: "Finish the research report for the AI project.",
      deadline: null,
      priority: "low",
      assignee: "Ali",
    },
    {
      title: "Team Meeting",
      description: "Join the team meeting tomorrow at 5 PM.",
      deadline: "Tomorrow at 5 PM",
      priority: "high",
      assignee: null,
    },
  ];
}
