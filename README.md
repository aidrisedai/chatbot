# 🤖 CodeTutor — Learn to Code with AI

A friendly, web-based AI chatbot that teaches people how to code. It explains the
**why** behind concepts (not just the how), shows runnable examples, helps debug
errors, and meets learners wherever they are — from their very first line of code
to picking up a new language.

Built with **Next.js (App Router)**, **TypeScript**, and the **Claude API**
(streaming, via the official Anthropic SDK).

## Features

- 💬 **Streaming chat** — answers appear token-by-token as Claude writes them.
- 🎨 **Rich rendering** — Markdown with syntax-highlighted code blocks.
- 🧑‍🏫 **Teaching-first system prompt** — Socratic where it helps, encouraging,
  jargon-light, and focused on building real understanding.
- 🧩 **Starter prompts** — one-click suggestions for absolute beginners.
- ⌨️ **Keyboard-friendly** — Enter to send, Shift+Enter for a newline.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Anthropic API key

```bash
cp .env.example .env.local
```

Then edit `.env.local` and set your key (get one at
[console.anthropic.com](https://console.anthropic.com/)):

```
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start learning.

## Configuration

| Variable            | Default           | Description                          |
| ------------------- | ----------------- | ------------------------------------ |
| `ANTHROPIC_API_KEY` | _(required)_      | Your Anthropic API key.              |
| `ANTHROPIC_MODEL`   | `claude-opus-4-8` | Override the Claude model if needed. |

## How it works

```
Browser (app/page.tsx)
  │  POST /api/chat  { messages: [...] }
  ▼
Next.js route (app/api/chat/route.ts)
  │  client.messages.stream(...)  ← Anthropic SDK
  ▼
Claude (claude-opus-4-8)  ──►  text streamed back to the browser
```

- The full conversation is sent on each request (the API is stateless), so
  CodeTutor remembers the context of your lesson.
- The teaching persona lives in [`lib/systemPrompt.ts`](lib/systemPrompt.ts) —
  tweak it to change the tutor's style.

## Project structure

```
app/
  api/chat/route.ts   # Streaming Claude endpoint
  layout.tsx          # Root layout + metadata
  page.tsx            # Chat UI + streaming client
  globals.css         # Styles
components/
  Message.tsx         # Markdown + syntax-highlighted message bubble
lib/
  systemPrompt.ts     # The tutor's teaching instructions
```

## Deployment

Deploys cleanly to any Node host that supports Next.js (e.g. Vercel). Set
`ANTHROPIC_API_KEY` in the host's environment variables, then build:

```bash
npm run build && npm start
```

## License

MIT
