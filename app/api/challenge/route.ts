import Anthropic from "@anthropic-ai/sdk";
import { CHALLENGE_SYSTEM, buildChallengeRequest } from "@/lib/challengePrompt";
import { isChallenge } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Pull a JSON object out of the model's reply, tolerating stray fences/prose.
function extractJson(text: string): unknown {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    t = t.slice(start, end + 1);
  }
  return JSON.parse(t);
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return json(
      {
        error:
          "Missing ANTHROPIC_API_KEY. Copy .env.example to .env.local and add your key.",
      },
      500
    );
  }

  let body: { track?: unknown; level?: unknown; recent?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const track =
    typeof body.track === "string" && body.track.trim()
      ? body.track.trim()
      : "beginner-friendly programming";
  const level =
    typeof body.level === "number" && body.level > 0
      ? Math.min(Math.floor(body.level), 20)
      : 1;
  const recent = Array.isArray(body.recent)
    ? body.recent.filter((r): r is string => typeof r === "string").slice(-10)
    : [];
  const kind =
    typeof (body as { kind?: unknown }).kind === "string"
      ? ((body as { kind: string }).kind)
      : "quick";

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: CHALLENGE_SYSTEM,
      messages: [
        { role: "user", content: buildChallengeRequest(track, level, recent, kind) },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = extractJson(text);
    if (!isChallenge(parsed)) {
      return json({ error: "The generated challenge was malformed. Try again." }, 502);
    }

    return json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return json({ error: message }, 500);
  }
}
