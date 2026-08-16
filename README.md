<div align="center">

# ⚡ TaskSnap AI

**Turn messy messages into actionable tasks — in seconds.**

Upload a screenshot. Get a prioritized, deadline-aware task list.
No typing. No copy-pasting. No missed assignments.

**Built with:**

<img src="https://cdn.simpleicons.org/typescript/3178C6" height="16" alt="TypeScript" /> TypeScript &nbsp;·&nbsp; <img src="https://cdn.simpleicons.org/nextdotjs/000000" height="16" alt="Next.js" /> Next.js 16 &nbsp;·&nbsp; <img src="https://cdn.simpleicons.org/react/61DAFB" height="16" alt="React" /> React 19 &nbsp;·&nbsp; <img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" height="16" alt="Tailwind CSS" /> Tailwind CSS v4 &nbsp;·&nbsp;
<img src="https://cdn.simpleicons.org/framer/0055FF" height="16" alt="Framer Motion" /> Framer Motion &nbsp;·&nbsp; ⚡ Groq AI

[About](#-about) · [Built for Chai aur Code](#-built-for-chai-aur-code) · [Features](#-features) · [How It Works](#-how-it-works) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Deployment](#-deployment) · [Contributing](#-contributing) · [License](#-license)

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
| 🧠 AI extraction | Reads the image and extracts tasks, deadlines, priorities, and assignees. |
| 🎯 Urgency Radar | Instantly highlights the highest-priority task that needs your attention. |
| 💡 What should I do now? | Recommends the next task to start, so you're never guessing. |
| ✅ Task tracking | Mark tasks complete, undo mistakes, and watch your progress bar fill up. |
| 🖼️ Preview + Reselect | Review your screenshot, rescan it, or pick a different image before extracting. |
| 🔄 Error recovery | Clear error states and one-click retry when an analysis fails. |
| 🧘 Reduced motion | Respects your OS motion preferences for accessibility. |

## 🚀 How It Works

```text
1. Upload    →  Drop a screenshot (drag-and-drop or click)
2. Review    →  Preview the image, reselect if needed
3. Extract   →  AI reads tasks, deadlines, priorities, and assignees
4. Complete  →  Work through the list — progress tracks itself
```

## 🧰 Tech Stack

| Category | Technology |
| --- | --- |
| Language | <img src="https://cdn.simpleicons.org/typescript/3178C6" height="14" alt="TypeScript" /> TypeScript |
| Framework | <img src="https://cdn.simpleicons.org/nextdotjs/000000" height="14" alt="Next.js" /> [Next.js 16](https://nextjs.org) — App Router, Turbopack, React Compiler |
| UI | <img src="https://cdn.simpleicons.org/react/61DAFB" height="14" alt="React" /> React 19, <img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" height="14" alt="Tailwind CSS" /> [Tailwind CSS v4](https://tailwindcss.com), <img src="https://cdn.simpleicons.org/lucide/B5F2FF" height="14" alt="Lucide" /> Lucide icons, <img src="https://cdn.simpleicons.org/googlefonts/4285F4" height="14" alt="Inter" /> Inter |
| Motion | <img src="https://cdn.simpleicons.org/framer/0055FF" height="14" alt="Framer Motion" /> [Framer Motion](https://www.framer.com/motion/) — with reduced-motion support |
| AI — primary | ⚡ [Groq](https://console.groq.com) — vision model with JSON mode |
| AI — fallback | <img src="https://cdn.simpleicons.org/googlegemini/8E75B2" height="14" alt="Google Gemini" /> Google Gemini — used automatically when no Groq key is set |
| Demo fallback | Built-in sample results when no AI key is configured |

### Code distribution

```
tsx ██████████████░░░░░░  TypeScript + JSX  72%
ts  ████░░░░░░░░░░░░░░░░  TypeScript        21%
css █░░░░░░░░░░░░░░░░░░░  CSS + Tailwind     7%
svg ░░░░░░░░░░░░░░░░░░░░  Icons             <1%
```

## 🚦 Getting Started

### Prerequisites

- **Node.js ≥ 20.9** (required by Next.js 16)
- A [Groq](https://console.groq.com/keys) API key (optional — app runs in demo mode without one)

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

## 🔑 Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GROQ_API_KEY` | Yes* | Your [Groq](https://console.groq.com/keys) API key for real analysis. |
| `AI_MODEL` | No | Model override. Default: `qwen/qwen3.6-27b`. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Gemini key — used only if `GROQ_API_KEY` is not set. |
| `DEMO_MODE` | No | `true` returns sample results when no AI key is configured. Keep `false` in production. |

\* Without a key, the app runs in **demo mode** with clearly labeled sample tasks.

## 📁 Project Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── analyze/          # POST — screenshot → AI → tasks
│   │   └── github-stars/     # GET — cached GitHub star count
│   ├── globals.css           # Design tokens, animations, reduced-motion
│   ├── icon.svg              # Custom favicon
│   ├── layout.tsx            # Metadata, fonts, theme
│   └── page.tsx              # Entry page
├── components/               # Navbar, Hero, UploadZone, TaskCard, ...
└── lib/                      # AI providers, validation, config, types
```

## 🧪 API Reference

### `POST /api/analyze`

Extracts tasks from a base64-encoded screenshot.

```bash
curl -X POST https://<your-domain>/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"image": "data:image/png;base64,..."}'
```

**Response:**

```json
{
  "tasks": [
    {
      "title": "Submit CN Assignment",
      "description": "Submit the Computer Networks assignment.",
      "deadline": "Monday",
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

Returns the repository's current star count (cached for 1 hour to avoid rate limits).

```json
{ "stars": 0 }
```

## 🌍 Deployment

### Vercel (recommended)

1. Push this repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — Vercel auto-detects Next.js.
3. Add environment variables under **Project → Settings → Environment Variables**:
   - `GROQ_API_KEY` — your Groq key
   - `DEMO_MODE` — `false`
4. Deploy. Done.

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository and create your branch from `master`.
2. **Set up** the project locally (see [Getting Started](#-getting-started)).
3. **Make your changes** — keep code style consistent and run the checks:
   ```bash
   npm run lint
   npm run build
   ```
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
