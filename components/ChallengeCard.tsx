"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Challenge } from "@/lib/types";

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
}: {
  challenge: Challenge;
  onResult: (correct: boolean) => void;
  onNext: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);

  const lang = normalizeLang(challenge.language);
  const lines = challenge.code.replace(/\n+$/, "").split("\n");

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

      {/* find_error: each line is clickable */}
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

      {/* fill_blank: show code, then an input */}
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

      {/* multiple_choice / predict_output: optional code + option buttons */}
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
    </div>
  );
}
