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

const SYSTEM_PROMPT_TEXT = `You are TaskSnap AI, an intelligent task extraction assistant.

Analyze the provided text that was extracted from a screenshot via OCR.

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
- Ignore OCR noise, stray characters, and duplicate lines.
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

function buildGroqBody(messages: Record<string, unknown>[]): Record<string, unknown> {
  const model = process.env.AI_MODEL?.trim() || "qwen/qwen3.8-27b";
  const body: Record<string, unknown> = {
    model,
    temperature: 0,
    max_tokens: 1200,
    response_format: { type: "json_object" },
    messages,
  };
  if (model.toLowerCase().includes("qwen")) {
    body.reasoning_effort = "none";
  }
  return body;
}

async function groqChat(body: Record<string, unknown>): Promise<Task[]> {
  const apiKey = getGroqKey();
  if (!apiKey) throw new Error("Missing Groq API key");

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

async function analyzeWithGroqImage(dataUrl: string): Promise<Task[]> {
  return groqChat(
    buildGroqBody([
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
    ]),
  );
}

const MAX_TEXT_LENGTH = 8000;

async function analyzeWithGroqText(text: string): Promise<Task[]> {
  const clipped = text.slice(0, MAX_TEXT_LENGTH);
  return groqChat(
    buildGroqBody([
      { role: "system", content: SYSTEM_PROMPT_TEXT },
      {
        role: "user",
        content: `Text extracted from the screenshot:\n\n${clipped}\n\nExtract the actionable tasks. Return JSON only.`,
      },
    ]),
  );
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

export interface AnalyzeInput {
  text?: string;
  image?: string;
}

export async function extractTasksFromInput(
  input: AnalyzeInput,
): Promise<Task[]> {
  const trimmedText = input.text?.trim();

  if (trimmedText && getGroqKey()) {
    const fromText = await analyzeWithGroqText(trimmedText);
    if (fromText.length > 0 || !input.image) return fromText;
    return analyzeWithGroqImage(input.image);
  }

  if (input.image) {
    if (getGroqKey()) return analyzeWithGroqImage(input.image);
    if (getGeminiKey()) return analyzeWithGemini(input.image);
  }

  throw new Error("No AI provider configured");
}

export function demoTasks(): Task[] {
  return [
    {
      title: "Submit project report",
      description: "Submit the final project report before the deadline.",
      deadline: "Friday",
      priority: "high",
      assignee: null,
    },
    {
      title: "Prepare presentation",
      description: "Prepare the presentation slides for next week.",
      deadline: "Wednesday",
      priority: "medium",
      assignee: null,
    },
    {
      title: "Write research notes",
      description: "Summarize the key findings from the reading.",
      deadline: null,
      priority: "low",
      assignee: "Team A",
    },
    {
      title: "Schedule team sync",
      description: "Set up a quick sync with the team.",
      deadline: "Tomorrow at 4 PM",
      priority: "medium",
      assignee: null,
    },
    {
      title: "Reply to client email",
      description: "Respond to the pending client inquiry.",
      deadline: null,
      priority: "high",
      assignee: "Team B",
    },
  ];
}
