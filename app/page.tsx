"use client";

import { useCallback, useState } from "react";
import { ChallengeCard } from "@/components/ChallengeCard";
import type { Challenge } from "@/lib/types";

const TRACKS = [
  { label: "Python", value: "Python for beginners", emoji: "🐍" },
  { label: "JavaScript", value: "JavaScript for beginners", emoji: "✨" },
  { label: "HTML & CSS", value: "HTML and CSS for beginners", emoji: "🎨" },
  { label: "Surprise me", value: "a surprise mix of beginner-friendly coding topics", emoji: "🎲" },
];

export default function Home() {
  const [track, setTrack] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeId, setChallengeId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);

  const level = 1 + Math.floor(solved / 3);

  const loadNext = useCallback(
    async (activeTrack: string, seen: string[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            track: activeTrack,
            level: 1 + Math.floor(solved / 3),
            recent: seen,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed.");
        const c = data as Challenge;
        setChallenge(c);
        setChallengeId((id) => id + 1);
        setRecent((prev) => [...prev, c.concept].slice(-10));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [solved]
  );

  function start(value: string) {
    setTrack(value);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSolved(0);
    setRecent([]);
    setChallenge(null);
    loadNext(value, []);
  }

  function handleResult(correct: boolean) {
    if (correct) {
      const bonus = 10 + streak * 2; // streak makes each win worth more
      setScore((s) => s + bonus);
      setStreak((st) => {
        const next = st + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setSolved((n) => n + 1);
    } else {
      setStreak(0);
    }
  }

  function handleNext() {
    if (track) loadNext(track, recent);
  }

  function backToMenu() {
    setTrack(null);
    setChallenge(null);
    setError(null);
  }

  // ---- Track picker ----
  if (!track) {
    return (
      <main className="game">
        <div className="menu">
          <div className="menu-logo">🎮</div>
          <h1>CodeQuest</h1>
          <p className="tagline">
            Learn to code by playing. Tiny challenges, instant feedback, real skills.
          </p>
          <div className="track-grid">
            {TRACKS.map((t) => (
              <button key={t.value} className="track" onClick={() => start(t.value)}>
                <span className="track-emoji">{t.emoji}</span>
                <span className="track-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // ---- Game screen ----
  return (
    <main className="game">
      <header className="hud">
        <button className="back" onClick={backToMenu} title="Change track">
          ← Menu
        </button>
        <div className="stats">
          <span className="stat" title="Score">
            ⭐ {score}
          </span>
          <span className="stat" title="Streak">
            🔥 {streak}
          </span>
          <span className="stat" title="Level">
            📈 Lv {level}
          </span>
        </div>
      </header>

      <div className="stage">
        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>Building your next challenge…</p>
          </div>
        )}

        {!loading && error && (
          <div className="error-box">
            <p>⚠️ {error}</p>
            <button className="next-btn" onClick={handleNext}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && challenge && (
          <ChallengeCard
            key={challengeId}
            challenge={challenge}
            onResult={handleResult}
            onNext={handleNext}
          />
        )}
      </div>

      <footer className="foot">
        Best streak: 🔥 {bestStreak} · Solved: {solved}
      </footer>
    </main>
  );
}
