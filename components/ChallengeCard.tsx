"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { isOpen, type Challenge, type GradeResult } from "@/lib/types";

function normalizeLang(lang: string): string {
  const l = lang.toLowerCase();
  if (l === "js" || l === "node") return "javascript";
  if (l === "py") return "python";
  return l;
}

export function ChallengeCard({
  challenge,
  onResult,
  onNext,
  onGrade,
  onSkip,
}: {
  challenge: Challenge;
  onResult: (correct: boolean) => void;
  onNext: () => void;
  onGrade?: (code: string) => Promise<GradeResult>;
  onSkip?: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);

  // Open-challenge (code editor) state
  const [code, setCode] = useState(challenge.code || "");
  const [grading, setGrading] = useState(false);
  const [graded, setGraded] = useState<GradeResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const lang = normalizeLang(challenge.language);
  const lines = challenge.code.replace(/\n+$/, "").split("\n");
  const open = isOpen(challenge.type);

  function commit(isCorrect: boolean) {
    setCorrect(isCorrect);
    setAnswered(true);
    onResult(isCorrect);
  }

  function chooseOption(option: string) {
    if (answered) return;
    setSelected(option);
    commit(option === challenge.answer);
  }

  function chooseLine(lineNumber: number) {
    if (answered) return;
    const val = String(lineNumber);
    setSelected(val);
    commit(val === challenge.answer.trim());
  }

  function submitBlank() {
    if (answered || !input.trim()) return;
    commit(input.trim() === challenge.answer.trim());
  }

  async function submitCode() {
    if (!onGrade || grading || !code.trim()) return;
    setGrading(true);
    const result = await onGrade(code);
    setGrading(false);
    setGraded(result);
    if (result.pass && !awarded) {
      setAwarded(true);
      onResult(true);
    }
  }

  function skipOpen() {
    setRevealed(true);
    setGraded(null);
    onSkip?.();
  }

  const showsOptions =
    challenge.type === "multiple_choice" || challenge.type === "predict_output";

  return (
    <div className="card">
      <div className="card-top">
        <span className="badge">{challenge.language}</span>
        <span className="badge type">{challenge.type.replace("_", " ")}</span>
      </div>

      {(challenge.teachPoint || challenge.teachExample) && (
        <div className="learn">
          <span className="learn-tag">💡</span>
          <div className="learn-body">
            {challenge.teachPoint && (
              <div className="learn-point">{challenge.teachPoint}</div>
            )}
            {challenge.teachExample && (
              <pre className="learn-ex">
                <code>{challenge.teachExample.replace(/\n+$/, "")}</code>
              </pre>
            )}
          </div>
        </div>
      )}

      <h2 className="card-title">{challenge.title}</h2>
      <p className="card-prompt">{challenge.prompt}</p>

      {/* ---------- OPEN: write code, AI grades ---------- */}
      {open && (
        <>
          {challenge.checks.length > 0 && (
            <ul className="checks">
              {challenge.checks.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}

          <textarea
            className="editor"
            spellCheck={false}
            value={code}
            placeholder="Write your code here…"
            onChange={(e) => setCode(e.target.value)}
            disabled={revealed || (graded?.pass ?? false)}
          />

          {grading && <p className="grading">🤖 Checking your code…</p>}

          {graded && (
            <div className={`feedback ${graded.pass ? "good" : "bad"}`}>
              <div className="verdict">
                {graded.pass ? "✅ Passed!" : "❌ Not yet"}
              </div>
              <div className="explanation">
                <ReactMarkdown>{graded.feedback}</ReactMarkdown>
              </div>
            </div>
          )}

          {!graded?.pass && !revealed && (
            <div className="open-actions">
              <button
                className="check-btn"
                onClick={submitCode}
                disabled={grading || !code.trim()}
              >
                {graded ? "Resubmit" : "Submit"}
              </button>
              <button className="ghost" onClick={skipOpen} disabled={grading}>
                Show solution & skip
              </button>
            </div>
          )}

          {(revealed || graded?.pass) && (
            <div className="solution-block">
              {graded?.pass && !showSolution && (
                <button className="ghost" onClick={() => setShowSolution(true)}>
                  Show a sample solution
                </button>
              )}
              {(revealed || showSolution) && (
                <>
                  <div className="sol-label">Sample solution</div>
                  <SyntaxHighlighter style={oneDark} language={lang} PreTag="div">
                    {challenge.solution.replace(/\n+$/, "")}
                  </SyntaxHighlighter>
                </>
              )}
              <button className="next-btn" onClick={onNext}>
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* ---------- QUICK auto-graded types ---------- */}
      {!open && (
        <>
          {challenge.type === "find_error" && (
            <div className="code-lines">
              {lines.map((line, i) => {
                const n = i + 1;
                const isAnswer = String(n) === challenge.answer.trim();
                let cls = "code-line";
                if (answered && isAnswer) cls += " correct";
                else if (answered && selected === String(n)) cls += " wrong";
                else if (selected === String(n)) cls += " picked";
                return (
                  <button
                    key={i}
                    className={cls}
                    onClick={() => chooseLine(n)}
                    disabled={answered}
                  >
                    <span className="ln">{n}</span>
                    <code>{line || " "}</code>
                  </button>
                );
              })}
            </div>
          )}

          {challenge.type === "fill_blank" && (
            <>
              {challenge.code && (
                <SyntaxHighlighter style={oneDark} language={lang} PreTag="div">
                  {challenge.code.replace(/\n+$/, "")}
                </SyntaxHighlighter>
              )}
              <div className="blank-row">
                <input
                  className="blank-input"
                  placeholder="fill the blank ( ___ )"
                  value={input}
                  disabled={answered}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitBlank();
                  }}
                />
                {!answered && (
                  <button
                    className="check-btn"
                    onClick={submitBlank}
                    disabled={!input.trim()}
                  >
                    Check
                  </button>
                )}
              </div>
            </>
          )}

          {showsOptions && (
            <>
              {challenge.code && (
                <SyntaxHighlighter style={oneDark} language={lang} PreTag="div">
                  {challenge.code.replace(/\n+$/, "")}
                </SyntaxHighlighter>
              )}
              <div className="options">
                {challenge.options.map((opt) => {
                  const isAnswer = opt === challenge.answer;
                  let cls = "option";
                  if (answered && isAnswer) cls += " correct";
                  else if (answered && selected === opt) cls += " wrong";
                  return (
                    <button
                      key={opt}
                      className={cls}
                      onClick={() => chooseOption(opt)}
                      disabled={answered}
                    >
                      <code>{opt}</code>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {answered && (
            <div className={`feedback ${correct ? "good" : "bad"}`}>
              <div className="verdict">
                {correct ? "✅ Nailed it!" : "❌ Not quite"}
              </div>
              {!correct && (
                <div className="answer-reveal">
                  Answer:{" "}
                  <code>
                    {challenge.type === "find_error"
                      ? `line ${challenge.answer}`
                      : challenge.answer}
                  </code>
                </div>
              )}
              <div className="explanation">
                <ReactMarkdown>{challenge.explanation}</ReactMarkdown>
              </div>
              <button className="next-btn" onClick={onNext}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
