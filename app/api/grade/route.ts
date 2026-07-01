import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

const GRADER_SYSTEM = `You grade a learner's code for a small coding challenge. You are encouraging but honest.

You are given the task, the language, the success criteria, and the learner's submission. Decide whether the submission accomplishes the task and meets the criteria.

Rules:
- Judge intent and correctness, not exact wording. Accept ANY working approach.
- Ignore trivial style/formatting nits. Do not require comments.
- If it works and meets the criteria, it passes.
- Keep feedback to at most 2 short sentences. If it passes, give brief praise plus one tip. If it fails, name the single most important thing to fix WITHOUT writing the full solution for them.

Respond with ONLY a JSON object: {"pass": boolean, "feedback": string}. No markdown, no code fences.`;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function extractJson(text: string): unknown {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) t = t.slice(start, end + 1);
  return JSON.parse(t);
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ error: "Missing ANTHROPIC_API_KEY." }, 500);
  }

  let body: {
    language?: unknown;
    prompt?: unknown;
    checks?: unknown;
    starter?: unknown;
    code?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const language = typeof body.language === "string" ? body.language : "code";
  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  const checks = Array.isArray(body.checks)
    ? body.checks.filter((c): c is string => typeof c === "string")
    : [];
  const starter = typeof body.starter === "string" ? body.starter : "";
  const code = typeof body.code === "string" ? body.code : "";

  if (!code.trim()) {
    return json({ pass: false, feedback: "Write some code first, then submit." });
  }

  const client = new Anthropic();
  const userMessage = `Language: ${language}
Task: ${prompt}
Success criteria:
${checks.map((c) => `- ${c}`).join("\n") || "- Accomplishes the task"}
${starter ? `\nStarter given to the learner:\n${starter}\n` : ""}
Learner's submission:
\`\`\`
${code}
\`\`\`

Grade it now as a single JSON object.`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: GRADER_SYSTEM,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = extractJson(text) as { pass?: unknown; feedback?: unknown };
    return json({
      pass: parsed.pass === true,
      feedback:
        typeof parsed.feedback === "string"
          ? parsed.feedback
          : "Graded — keep going!",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Grading failed.";
    return json({ error: message }, 500);
  }
}
