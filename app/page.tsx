"use client";

import { useCallback, useEffect, useState } from "react";
import { ChallengeCard } from "@/components/ChallengeCard";
import type { Challenge } from "@/lib/types";

const TRACKS = [
  { label: "Python", value: "Python for beginners", emoji: "🐍" },
  { label: "JavaScript", value: "JavaScript for beginners", emoji: "✨" },
  { label: "HTML & CSS", value: "HTML and CSS for beginners", emoji: "🎨" },
  { label: "Surprise me", value: "a surprise mix of beginner-friendly coding topics", emoji: "🎲" },
];

const STORAGE_KEY = "codequest:v1";

type Progress = {
  score: number;
  streak: number;
  bestStreak: number;
  solved: number;
  recent: string[];
};

const EMPTY: Progress = {
  score: 0,
  streak: 0,
  bestStreak: 0,
  solved: 0,
  recent: [],
};

function levelFor(solved: number) {
  return 1 + Math.floor(solved / 3);
}

export default function Home() {
  // Per-track saved progress, persisted to localStorage.
  const [allProgress, setAllProgress] = useState<Record<string, Progress>>({});
  const [hydrated, setHydrated] = useState(false);

  const [track, setTrack] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeId, setChallengeId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved progress once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAllProgress(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Save whenever progress changes (after the initial load).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    } catch {
      /* storage may be unavailable */
    }
  }, [allProgress, hydrated]);

  const current: Progress = (track && allProgress[track]) || EMPTY;
  const level = levelFor(current.solved);

  const loadNext = useCallback(
    async (activeTrack: string, forLevel: number, recent: string[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ track: activeTrack, level: forLevel, recent }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed.");
        const c = data as Challenge;
        setChallenge(c);
        setChallengeId((id) => id + 1);
        setAllProgress((prev) => {
          const p = prev[activeTrack] || EMPTY;
          return {
            ...prev,
            [activeTrack]: { ...p, recent: [...p.recent, c.concept].slice(-10) },
          };
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  function start(value: string) {
    // Resume saved progress for this track (do NOT reset it).
    const saved = allProgress[value] || EMPTY;
    setTrack(value);
    setChallenge(null);
    setError(null);
    loadNext(value, levelFor(saved.solved), saved.recent);
  }

  function handleResult(correct: boolean) {
    if (!track) return;
    setAllProgress((prev) => {
      const p = prev[track] || EMPTY;
      if (correct) {
        const bonus = 10 + p.streak * 2; // streak makes each win worth more
        const streak = p.streak + 1;
        return {
          ...prev,
          [track]: {
            ...p,
            score: p.score + bonus,
            streak,
            bestStreak: Math.max(p.bestStreak, streak),
            solved: p.solved + 1,
          },
        };
      }
      return { ...prev, [track]: { ...p, streak: 0 } };
    });
  }

  function handleNext() {
    if (track) loadNext(track, level, current.recent);
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
            {TRACKS.map((t) => {
              const saved = allProgress[t.value];
              return (
                <button key={t.value} className="track" onClick={() => start(t.value)}>
                  <span className="track-emoji">{t.emoji}</span>
                  <span className="track-label">{t.label}</span>
                  {saved && saved.solved > 0 && (
                    <span className="track-save">
                      Lv {levelFor(saved.solved)} · ⭐ {saved.score}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    );
  }

  // ---- Game screen ----
  return (
    <main className="game">
      <header className="hud">
        <button className="back" onClick={backToMenu} title="Change track (progress is saved)">
          ← Menu
        </button>
        <div className="stats">
          <span className="stat" title="Score">
            ⭐ {current.score}
          </span>
          <span className="stat" title="Streak">
            🔥 {current.streak}
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
        Best streak: 🔥 {current.bestStreak} · Solved: {current.solved} · progress saves automatically
      </footer>
    </main>
  );
}
