import { ALLOWED_IMAGE_MIME, MAX_TEXT_LENGTH } from "./config";
import type { AnalyzeInput, Task } from "./types";
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

const ALLOWED_MIME = new Set<string>(ALLOWED_IMAGE_MIME);

const MAX_OUTPUT_TOKENS = 4000;
const PER_CALL_TIMEOUT_MS = 40_000;
// Route handlers run with `maxDuration = 60`; the whole chain shares a
// budget so retries can never outlive the function.
const TOTAL_BUDGET_MS = 55_000;
const MAX_RETRY_AFTER_MS = 15_000;

// Model fallbacks when neither GROQ_MODEL nor AI_MODEL is set.
const DEFAULT_GROQ_MODEL = "qwen/qwen3.8-27b";
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Errors that must not trigger a provider fallback (retrying cannot help). */
class FatalApiError extends ApiError {
  constructor(message: string, status: number) {
    super(message, status);
    this.name = "FatalApiError";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function isAbortError(error: unknown): boolean {
  return (error as { name?: string }).name === "AbortError";
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
    if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  }
  const match = body.match(/try again in ([\d.]+)s/i);
  if (match) {
    const seconds = Number(match[1]);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
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

function groqModel(): string {
  return (
    process.env.GROQ_MODEL?.trim() ||
    process.env.AI_MODEL?.trim() ||
    DEFAULT_GROQ_MODEL
  );
}

function geminiModel(): string {
  return (
    process.env.GEMINI_MODEL?.trim() ||
    process.env.AI_MODEL?.trim() ||
    DEFAULT_GEMINI_MODEL
  );
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

const TRUNCATED_MESSAGE =
  "This screenshot has too much text to analyze in one pass. Try a smaller or cropped screenshot.";

/** Shown to users whenever analysis cannot run — never mentions config or env vars. */
export const UNAVAILABLE_MESSAGE =
  "Analysis isn't available right now. Please try again later.";

function decodeCompletion(content: string, truncated: boolean): Task[] {
  const tasks = parseAnalyzeResponse(extractJson(content));
  if (!truncated) return tasks;
  // A cut-off response may still contain complete task objects; keep them.
  if (tasks.length > 0) return tasks;
  throw new FatalApiError(TRUNCATED_MESSAGE, 422);
}

function remainingMs(deadline: number): number {
  return deadline - Date.now();
}

function timedOut(): ApiError {
  return new ApiError("The AI took too long to respond. Please try again.", 500);
}

function providerRejection(status: number): ApiError {
  console.warn(`AI provider rejected the request with status ${status}.`);
  return new ApiError(
    "The AI couldn't process this screenshot. Please try again.",
    status,
  );
}

async function handleRetryableRateLimit(
  response: Response,
  attempt: number,
  deadline: number,
): Promise<boolean> {
  if (response.status !== 429 || attempt >= 2) return false;
  const bodyText = await response.text().catch(() => "");
  const waitMs = parseRetryAfter(response, bodyText);
  const fitsBudget =
    waitMs !== null &&
    waitMs <= MAX_RETRY_AFTER_MS &&
    remainingMs(deadline) - waitMs > 5_000;
  if (fitsBudget && waitMs !== null) {
    await sleep(waitMs);
    return true;
  }
  const message =
    waitMs !== null
      ? `AI is busy right now. Try again in ${Math.ceil(waitMs / 1000)}s.`
      : "AI is busy right now. Wait a moment and try again.";
  console.warn(
    "AI provider rate limited:",
    extractErrorMessage(bodyText) ?? `status ${response.status}`,
  );
  throw new ApiError(message, 429);
}

function buildGroqBody(
  messages: Record<string, unknown>[],
): Record<string, unknown> {
  const model = groqModel();
  const body: Record<string, unknown> = {
    model,
    temperature: 0,
    max_tokens: MAX_OUTPUT_TOKENS,
    response_format: { type: "json_object" },
    messages,
  };
  if (model.toLowerCase().includes("qwen")) {
    body.reasoning_effort = "none";
  }
  return body;
}

async function groqChat(
  messages: Record<string, unknown>[],
  deadline: number,
): Promise<Task[]> {
  const apiKey = getGroqKey();
  if (!apiKey) throw new ApiError(UNAVAILABLE_MESSAGE, 500);

  const body = JSON.stringify(buildGroqBody(messages));

  for (let attempt = 1; ; attempt += 1) {
    const budget = remainingMs(deadline);
    if (budget < 1_000) throw timedOut();

    let response: Response;
    try {
      response = await fetchWithTimeout(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body,
        },
        Math.min(PER_CALL_TIMEOUT_MS, budget),
      );
    } catch (error) {
      if (isAbortError(error)) throw timedOut();
      throw error;
    }

    if (await handleRetryableRateLimit(response, attempt, deadline)) continue;

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      console.error(`Groq API ${response.status}: ${bodyText.slice(0, 500)}`);
      if (response.status >= 400 && response.status < 500) {
        throw providerRejection(response.status);
      }
      throw new Error(`AI provider returned ${response.status}`);
    }

    const data = await response.json();
    const completion = data?.choices?.[0];
    const content: string = completion?.message?.content ?? "";
    return decodeCompletion(content, completion?.finish_reason === "length");
  }
}

async function analyzeWithGroqImage(
  dataUrl: string,
  deadline: number,
): Promise<Task[]> {
  return groqChat(
    [
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
    deadline,
  );
}

async function analyzeWithGroqText(
  text: string,
  deadline: number,
): Promise<Task[]> {
  const clipped = text.slice(0, MAX_TEXT_LENGTH);
  return groqChat(
    [
      { role: "system", content: SYSTEM_PROMPT_TEXT },
      {
        role: "user",
        content: `Text extracted from the screenshot:\n\n${clipped}\n\nExtract the actionable tasks. Return JSON only.`,
      },
    ],
    deadline,
  );
}

function geminiRequestBody(
  parts: Record<string, unknown>[],
  systemPrompt: string,
): string {
  return JSON.stringify({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
    contents: [{ role: "user", parts }],
  });
}

async function geminiGenerate(
  body: string,
  deadline: number,
): Promise<{ truncated: boolean; content: string }> {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new ApiError(UNAVAILABLE_MESSAGE, 500);

  const model = geminiModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  for (let attempt = 1; ; attempt += 1) {
    const budget = remainingMs(deadline);
    if (budget < 1_000) throw timedOut();

    let response: Response;
    try {
      response = await fetchWithTimeout(
        url,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        },
        Math.min(PER_CALL_TIMEOUT_MS, budget),
      );
    } catch (error) {
      if (isAbortError(error)) throw timedOut();
      throw error;
    }

    if (await handleRetryableRateLimit(response, attempt, deadline)) continue;

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      console.error(`Gemini API ${response.status}: ${bodyText.slice(0, 500)}`);
      if (response.status >= 400 && response.status < 500) {
        throw providerRejection(response.status);
      }
      throw new Error(`AI provider returned ${response.status}`);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const content: string = candidate?.content?.parts?.[0]?.text ?? "";
    return {
      content,
      truncated: candidate?.finishReason === "MAX_TOKENS",
    };
  }
}

async function analyzeWithGeminiImage(
  dataUrl: string,
  deadline: number,
): Promise<Task[]> {
  const mime = dataUrl.split(";")[0].split(":")[1] || "image/png";
  const base64 = dataUrl.split(",")[1] || "";
  const { content, truncated } = await geminiGenerate(
    geminiRequestBody(
      [
        { inlineData: { mimeType: mime, data: base64 } },
        { text: "Extract the actionable tasks from this screenshot." },
      ],
      SYSTEM_PROMPT,
    ),
    deadline,
  );
  return decodeCompletion(content, truncated);
}

async function analyzeWithGeminiText(
  text: string,
  deadline: number,
): Promise<Task[]> {
  const clipped = text.slice(0, MAX_TEXT_LENGTH);
  const { content, truncated } = await geminiGenerate(
    geminiRequestBody(
      [
        {
          text: `Text extracted from the screenshot:\n\n${clipped}\n\nExtract the actionable tasks. Return JSON only.`,
        },
      ],
      SYSTEM_PROMPT_TEXT,
    ),
    deadline,
  );
  return decodeCompletion(content, truncated);
}

interface Provider {
  text?: (text: string, deadline: number) => Promise<Task[]>;
  image?: (image: string, deadline: number) => Promise<Task[]>;
}

export async function extractTasksFromInput(
  input: AnalyzeInput,
): Promise<Task[]> {
  const text = input.text?.trim() || undefined;
  const image = input.image;

  const providers: Provider[] = [];
  if (getGroqKey()) {
    providers.push({
      text: analyzeWithGroqText,
      image: analyzeWithGroqImage,
    });
  }
  if (getGeminiKey()) {
    providers.push({
      text: analyzeWithGeminiText,
      image: analyzeWithGeminiImage,
    });
  }
  if (providers.length === 0) {
    throw new ApiError(UNAVAILABLE_MESSAGE, 503);
  }

  const deadline = Date.now() + TOTAL_BUDGET_MS;
  let lastError: unknown = null;

  for (const provider of providers) {
    if (text && provider.text) {
      try {
        const tasks = await provider.text(text, deadline);
        // Text is cheaper than vision; only send the image when it found
        // nothing and the caller actually supplied one.
        if (tasks.length > 0 || !image || !provider.image) return tasks;
      } catch (error) {
        if (error instanceof FatalApiError) throw error;
        lastError = error;
        continue;
      }
    }

    if (image && provider.image) {
      try {
        return await provider.image(image, deadline);
      } catch (error) {
        if (error instanceof FatalApiError) throw error;
        lastError = error;
      }
    }
  }

  if (lastError) throw lastError;
  throw new ApiError(UNAVAILABLE_MESSAGE, 503);
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
