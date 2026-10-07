<div align="center">

# ⚡ TaskSnap AI

**Turn messy messages into actionable tasks — in seconds.**

Upload a screenshot. Get a prioritized, deadline-aware task list.
No typing. No copy-pasting. No missed assignments.

**Built with:**

<img src="https://cdn.simpleicons.org/typescript/3178C6" height="16" alt="TypeScript" /> TypeScript &nbsp;·&nbsp; <img src="https://cdn.simpleicons.org/nextdotjs/000000" height="16" alt="Next.js" /> Next.js 16 &nbsp;·&nbsp; <img src="https://cdn.simpleicons.org/react/61DAFB" height="16" alt="React" /> React 19 &nbsp;·&nbsp; <img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" height="16" alt="Tailwind CSS" /> Tailwind CSS v4 &nbsp;·&nbsp;
<img src="https://cdn.simpleicons.org/framer/0055FF" height="16" alt="Framer Motion" /> Framer Motion &nbsp;·&nbsp; 🔤 Tesseract.js &nbsp;·&nbsp; ⚡ Groq AI

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-22c55e?style=flat-square&logo=vercel)](https://tasksnapai-aui.vercel.app) [![CI](https://github.com/afaqulislam/tasksnap-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/afaqulislam/tasksnap-ai/actions/workflows/ci.yml) [![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org) [![License: MIT](https://img.shields.io/badge/License-MIT-teal?style=flat-square)](LICENSE)

[About](#-about) · [Built for Chai aur Code](#-built-for-chai-aur-code) · [Features](#-features) · [How It Works](#-how-it-works) · [Reliability](#-reliability) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Deployment](#-deployment) · [Contributing](#-contributing) · [License](#-license)

</div>

---

## 📌 About

Every day, important action items get lost in chat noise — a *"submit by Monday"* buried between memes, a *"finish the report"* at the bottom of a wall of text. **You can't prioritize what you can't see.**

TaskSnap AI fixes this. Take a screenshot of any conversation, announcement, or message — the AI reads it, extracts every actionable task, and hands you a clean, prioritized list with deadlines and assignees.

Built as a lightweight, single-page MVP: **no account, no signup, no bloat.**

## 🏆 Built for Chai aur Code

TaskSnap AI was built for the **Chai aur Code** vibe coding session — a monthly event organized by [GDG Live Pakistan](https://gdg.community.dev/gdg-live-pakistan/) where the community gets one theme and two hours to build whatever they can imagine.

One theme is dropped. You build — an app, a game, a landing page, a bot, an automation. Anything. At the end, everyone shows what they made, the community votes, and the top build walks away with swags. This is my first session — and this project is the result.


## ✨ Features

| Feature | What it does |
| --- | --- |
| 📸 Screenshot upload | Drag-and-drop or click to browse. PNG, JPG, JPEG, or WEBP — up to 8 MB. |
| 🔎 In-browser OCR | Text is read locally with [Tesseract.js](https://github.com/naptha/tesseract.js) — private and zero API tokens. Any language Tesseract supports (`NEXT_PUBLIC_OCR_LANGS`). |
| 🧠 AI extraction | Turns the extracted text into tasks, deadlines, priorities, and assignees (the image is sent only when OCR can't read the screenshot). |
| ⚡ Smart optimization | Images are auto-resized (max 1024px) and only text reaches the AI — fast and token-friendly. |
| 🔒 Private by default | Reading happens in your browser; only extracted text is sent to the AI provider. No screenshots, text, or tasks are ever stored — the only server-side state is an in-memory per-IP rate-limit counter that expires with the 10-minute window. |
| 🚦 Fair usage limits | Per-IP rate limiting (10 analyses / 10 min) keeps the free AI tier usable for everyone. |
| 🎯 Urgency Radar | Highlights the highest-priority task — earliest deadline wins within a priority. Deadlines are understood in plain English ("Friday", "tomorrow at 4 PM", "in 3 days", "2026-10-10"). |
| 💡 What should I do now? | Recommends the next task to start, so you're never guessing. |
| ✅ Task tracking | Mark tasks complete, undo mistakes, and watch your progress bar fill up. |
| 🖼️ Preview + Reselect | Review your screenshot, rescan it, or pick a different image before extracting. |
| 🔄 Error recovery | Clear error states, request timeouts, provider fallback, and one-click retry. |
| 🧘 Reduced motion | Respects your OS motion preferences for accessibility. |

## 🚀 How It Works

```text
1. Upload    →  Drop a screenshot (drag-and-drop or click)
2. Read      →  OCR extracts the text locally in your browser
3. Extract   →  AI turns the text into tasks, deadlines, and priorities
4. Complete  →  Work through the list — progress tracks itself
```

## 🛡️ Reliability

The interesting part of this project isn't the extraction — it's everything that happens when a third party misbehaves. Free-tier AI providers rate-limit, OCR sometimes reads garbage, and users double-click.

| Risk | How it's handled |
| --- | --- |
| AI provider outage or rate limit | Automatic fallback chain — Groq → Gemini — plus one retry for short `Retry-After` waits that still fit the request budget. |
| Hanging requests | Every provider call has a 40s timeout inside a 55s budget shared by the whole chain, and failures return a readable message instead of spinning forever. |
| Garbled OCR output | Text under 40 characters or with under 30% letters (any script — including Urdu, Arabic, and CJK) is discarded and the image path is used instead. |
| Truncated AI responses | `max_tokens` is 4000; cut-off responses keep any complete tasks they contain, and otherwise return a clear "too much text" error rather than a false "no tasks". |
| Double submits | The client guards concurrent analysis, so one click can't burn two API calls. |
| Slow first OCR load | OCR has a 45s budget, then the image fallback takes over. |
| Long waits | The client caps each analysis at 70s and offers a Cancel button that returns you to your screenshot anytime — nothing hangs forever. |
| Malformed or oversized uploads | Empty files, unsupported types, invalid data URLs, >8 MB images, and >12 MB request bodies are rejected with a `4xx` before any AI call. |
| Abuse and spam | Sliding-window rate limiting keyed on the last (proxy-appended) `x-forwarded-for` hop — 10 requests / 10 minutes. Provider `429`s and unexpected `5xx` failures refund the slot; demo responses skip it entirely. |
| No AI key configured | `503` with an actionable message, or clearly labeled sample data when `DEMO_MODE=true`. |
| Provider errors in the UI | Meaningful, non-technical error messages instead of raw provider payloads. |

## 🧰 Tech Stack

| Category | Technology |
| --- | --- |
| Language | <img src="https://cdn.simpleicons.org/typescript/3178C6" height="14" alt="TypeScript" /> TypeScript |
| Framework | <img src="https://cdn.simpleicons.org/nextdotjs/000000" height="14" alt="Next.js" /> [Next.js 16](https://nextjs.org) — App Router, Turbopack, React Compiler |
| UI | <img src="https://cdn.simpleicons.org/react/61DAFB" height="14" alt="React" /> React 19, <img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" height="14" alt="Tailwind CSS" /> [Tailwind CSS v4](https://tailwindcss.com), <img src="https://cdn.simpleicons.org/lucide/B5F2FF" height="14" alt="Lucide" /> Lucide icons, Space Grotesk (display), Inter (UI), JetBrains Mono (labels) |
| Motion | <img src="https://cdn.simpleicons.org/framer/0055FF" height="14" alt="Framer Motion" /> [Framer Motion](https://www.framer.com/motion/) — with reduced-motion support |
| AI — primary | ⚡ [Groq](https://console.groq.com) — text-first with JSON mode, vision fallback |
| OCR | [Tesseract.js](https://github.com/naptha/tesseract.js) — runs in the browser, zero API tokens |
| AI — fallback | <img src="https://cdn.simpleicons.org/googlegemini/8E75B2" height="14" alt="Google Gemini" /> Google Gemini — used automatically when Groq is missing or errors |
| Demo fallback | Built-in sample results when `DEMO_MODE=true` and no AI key is set |
| Testing | Vitest — deadline parsing, response validation, urgency ranking, rate limiting, OCR sanity gate |
| Quality | GitHub Actions CI — ESLint, `tsc --noEmit`, Vitest, and `next build` on every push |

### Code distribution

```
tsx ███████████░░░░░░░░░  TypeScript + JSX  56%
ts  ████████░░░░░░░░░░░░  TypeScript        41%
css █░░░░░░░░░░░░░░░░░░░  CSS + Tailwind     3%
svg ░░░░░░░░░░░░░░░░░░░░  Icons             <1%
```

## 🚦 Getting Started

### Prerequisites

- **Node.js ≥ 22.12** — Next.js 16 itself only needs ≥ 20.9, but `npm test` (Vitest 5) requires ≥ 22.12. CI runs on Node 22.
- A [Groq](https://console.groq.com/keys) API key (optional — set `DEMO_MODE=true` to run without one)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/afaqulislam/tasksnap-ai.git
cd tasksnap-ai

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm test` | Run the Vitest unit tests |

## 🔑 Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GROQ_API_KEY` | Yes* | Your [Groq](https://console.groq.com/keys) API key for real analysis. |
| `GROQ_MODEL` | No | Groq model override. Default: `qwen/qwen3.8-27b`. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Gemini key — used when `GROQ_API_KEY` is missing **or** when Groq returns an error. |
| `GEMINI_MODEL` | No | Gemini model override. Default: `gemini-2.0-flash`. |
| `AI_MODEL` | No | Legacy single override applied to **both** providers. Prefer `GROQ_MODEL` / `GEMINI_MODEL` — with both keys set, this makes Groq request a Gemini model (and fail). |
| `DEMO_MODE` | No | `true` returns sample results when no AI key is configured. Keep `false` in production. |
| `NEXT_PUBLIC_OCR_LANGS` | No | Tesseract language codes for in-browser OCR, comma-separated. Default: `eng`. Add any languages, e.g. `eng,urd,ara`. |

\* Without a key: `DEMO_MODE=true` returns **demo mode** with clearly labeled sample tasks; `DEMO_MODE=false` makes `/api/analyze` respond `503` with an actionable message.

> **Tip:** Screenshot text is read locally in your browser with [Tesseract.js](https://github.com/naptha/tesseract.js) — zero API tokens spent on OCR. The AI only receives the extracted text, so each analysis costs a fraction of the tokens a raw image would. The API still accepts images directly as a fallback (e.g. when OCR finds nothing useful).

## 📁 Project Structure

```text
.github/workflows/ci.yml         # Lint + typecheck + test + build on every push
vitest.config.mts                # Unit test setup (@ path alias, src/**/*.test.ts)
src/
├── app/
│   ├── api/
│   │   ├── analyze/          # POST — screenshot/text → AI → tasks
│   │   └── github-stars/     # GET — cached GitHub star count
│   ├── globals.css           # Design tokens, animations, reduced-motion
│   ├── icon.svg              # Custom favicon
│   ├── layout.tsx            # Metadata, fonts, theme
│   └── page.tsx              # Entry page
├── components/               # Navbar, Hero, UploadZone, TaskCard, ...
└── lib/
    ├── ai.ts                 # Groq + Gemini providers, prompts, fallback chain
    ├── cn.ts                 # class name utility (clsx + tailwind-merge)
    ├── config.ts             # Site/repo links, upload & rate-limit constants
    ├── deadline.ts           # Plain-English deadline → timestamp parser
    ├── ocr.ts                # Tesseract worker, OCR sanity check
    ├── priority.ts           # Urgency ranking, deadline ordering
    ├── rate-limit.ts         # Sliding-window per-IP limiter
    ├── validate.ts           # Task response parsing & sanitising
    ├── types.ts              # Shared types
    └── *.test.ts             # Unit tests for deadline, validate, priority, rate-limit, OCR sanity
```

## 🧪 API Reference

### `POST /api/analyze`

Extracts tasks from screenshot content. Send `text` (OCR output extracted on the client) and/or `image` (base64 data URL — used directly when OCR finds nothing useful).

```bash
# Text-first (OCR output from the browser)
curl -X POST https://<your-domain>/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Submit the math assignment by Friday."}'

# Image fallback (analyzed directly by the AI)
curl -X POST https://<your-domain>/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/png;base64,..."}'
```

> **Note:** Images are auto-resized to a max dimension of 1024px before being sent to the AI provider to minimize token usage. Request bodies are capped at 12 MB before they are parsed. Requests are throttled per IP — 10 per 10 minutes on a sliding window, keyed on the last (`x-forwarded-for`) hop — and return `429` with a `Retry-After` header when exceeded. Groq's own free tier is also rate-limited (short token-per-minute windows); the API retries automatically once for short waits that still fit its 55s budget, falls back to Gemini when its key is configured, and otherwise surfaces a readable `429` message.

**Status codes:**

| Status | When |
| --- | --- |
| `200` | Success — `tasks` array (possibly empty) plus a `demo` flag. |
| `400` | Invalid JSON, no `text`/`image`, unsupported image type, or an image over 8 MB. Rejected before any AI call. |
| `413` | Request body over 12 MB — rejected before it is parsed. |
| `422` | The provider's reply was cut short and held no usable tasks (screenshot too dense for one pass). |
| `429` | Per-IP limit reached (`Retry-After` header included) or the AI provider is rate-limited. |
| `500` | Provider failure or timeout after all fallbacks were attempted. |
| `503` | No AI provider key is configured and `DEMO_MODE` is off. |

**Response:**

```json
{
  "tasks": [
    {
      "title": "Submit project report",
      "description": "Submit the final project report before the deadline.",
      "deadline": "Friday",
      "priority": "high",
      "assignee": null
    }
  ],
  "demo": false
}
```

| Field | Type | Description |
| --- | --- | --- |
| `title` | `string` | Short task title |
| `description` | `string` | Concise task description |
| `deadline` | `string \| null` | Due date/time, when explicitly stated |
| `priority` | `"high" \| "medium" \| "low"` | Inferred or explicit priority |
| `assignee` | `string \| null` | Assigned person, when explicitly stated |

### `GET /api/github-stars`

Returns the repository's current star count (cached for 1 hour to avoid rate limits). Returns `{ "stars": null }` with a `200` if GitHub is unreachable, so a flaky API never breaks the page.

```json
{ "stars": 0 }
```

## 🌍 Deployment

### Vercel (recommended)

1. Push this repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — Vercel auto-detects Next.js.
3. Add environment variables under **Project → Settings → Environment Variables**:
   - `GROQ_API_KEY` — your Groq key
   - `GROQ_MODEL` — optional Groq model override
   - `GEMINI_MODEL` — optional Gemini model override
   - `GOOGLE_GENERATIVE_AI_API_KEY` — optional Gemini backup provider
   - `NEXT_PUBLIC_OCR_LANGS` — optional, e.g. `eng,urd`
   - `DEMO_MODE` — `false` (leaving it off also means `503` when no key is set)
4. Deploy. Done.

> Note: `NEXT_PUBLIC_*` variables are inlined at build time — change them and redeploy.

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository and create your branch from `main`.
2. **Set up** the project locally (see [Getting Started](#-getting-started)).
3. **Make your changes** — keep code style consistent and run the checks:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```
   CI runs the same four checks on every pull request.
4. **Open a Pull Request** with a clear description of what you changed and why.

Guidelines:
- Keep changes focused — one feature or fix per PR.
- No new dependencies without a clear justification.
- Respect the existing design system and motion behavior.
- Ensure accessibility (`prefers-reduced-motion`, keyboard navigation, contrast).

Found a bug or have an idea? Open an [issue](https://github.com/afaqulislam/tasksnap-ai/issues).

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-afaqulislam-181717?logo=github&logoColor=white&style=for-the-badge)](https://github.com/afaqulislam) [![LinkedIn](https://img.shields.io/badge/LinkedIn-afaqulislam-0A66C2?logo=linkedin&logoColor=white&style=for-the-badge)](https://www.linkedin.com/in/afaqulislam) [![X](https://img.shields.io/badge/X-%40afaqulislam708-000000?logo=x&logoColor=white&style=for-the-badge)](https://x.com/afaqulislam708)

Built with ☕ for **Chai aur Code**

© 2026 TaskSnap AI. All rights reserved.

</div>
