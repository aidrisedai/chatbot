"use client";

import { useCallback, useEffect, useState } from "react";
import { ChallengeCard } from "@/components/ChallengeCard";
import { Shop } from "@/components/Shop";
import { DailyGoals } from "@/components/DailyGoals";
import { Avatar } from "@/components/Avatar";
import { Closet } from "@/components/Closet";
import type { Challenge } from "@/lib/types";
import { defaultAvatar, type AvatarItem } from "@/lib/avatar";
import { playSound, setMuted } from "@/lib/sound";
import {
  applyAnswer,
  BOOST_DURATION,
  defaultState,
  EMPTY_TRACK,
  ensureToday,
  LIFE_COST,
  MAX_LIVES,
  START_LIVES,
  xpToNext,
  type GameState,
} from "@/lib/game";

const TRACKS = [
  { label: "Python", value: "Python for beginners", emoji: "🐍" },
  { label: "JavaScript", value: "JavaScript for beginners", emoji: "✨" },
  { label: "HTML & CSS", value: "HTML and CSS for beginners", emoji: "🎨" },
  { label: "Surprise me", value: "a surprise mix of beginner-friendly coding topics", emoji: "🎲" },
];

const STORAGE_KEY = "codequest:v2";

export default function Home() {
  const [state, setState] = useState<GameState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  const [track, setTrack] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challengeId, setChallengeId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [closetOpen, setClosetOpen] = useState(false);

  // Load saved state once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GameState;
        setState({
          ...defaultState(),
          ...parsed,
          daily: ensureToday(parsed.daily),
          avatar: parsed.avatar ?? defaultAvatar(),
        });
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Keep the sound engine in sync with the mute setting.
  useEffect(() => {
    setMuted(state.muted);
  }, [state.muted]);

  // Persist on change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage may be unavailable */
    }
  }, [state, hydrated]);

  const cur = (track && state.tracks[track]) || EMPTY_TRACK;
  const need = xpToNext(cur.level);
  const xpPct = Math.min(100, Math.round((cur.xp / need) * 100));
  const outOfLives = !!track && state.lives <= 0;

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
        setState((prev) => {
          const p = prev.tracks[activeTrack] || EMPTY_TRACK;
          return {
            ...prev,
            tracks: {
              ...prev.tracks,
              [activeTrack]: { ...p, recent: [...p.recent, c.concept].slice(-10) },
            },
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
    setTrack(value);
    setChallenge(null);
    setError(null);
    setState((s) => ({ ...s, daily: ensureToday(s.daily) }));
    const saved = state.tracks[value] || EMPTY_TRACK;
    if (state.lives > 0) loadNext(value, saved.level, saved.recent);
  }

  function handleResult(correct: boolean) {
    if (!track) return;
    const before = state.tracks[track] || EMPTY_TRACK;
    const next = applyAnswer(state, track, correct, Math.random());
    setState(next);
    const after = next.tracks[track];
    if (correct) playSound(after.level > before.level ? "levelUp" : "correct");
    else playSound("wrong");
  }

  function handleNext() {
    if (!track || state.lives <= 0) return; // out-of-lives overlay handles it
    playSound("click");
    loadNext(track, cur.level, cur.recent);
  }

  function toggleMute() {
    setState((s) => ({ ...s, muted: !s.muted }));
  }

  function backToMenu() {
    setTrack(null);
    setChallenge(null);
    setError(null);
    setShopOpen(false);
  }

  // Shop / revive actions
  function buyLife() {
    setState((s) =>
      s.coins >= LIFE_COST && s.lives < MAX_LIVES
        ? { ...s, coins: s.coins - LIFE_COST, lives: s.lives + 1 }
        : s
    );
    playSound("buy");
  }

  function buyBoost(mult: number) {
    const item = { 1.5: 30, 2: 60, 3: 120 }[mult as 1.5 | 2 | 3];
    if (item == null) return;
    setState((s) =>
      s.coins >= item
        ? { ...s, coins: s.coins - item, boost: { mult, remaining: BOOST_DURATION } }
        : s
    );
    playSound("buy");
  }

  function reviveWithCoins() {
    if (!track || state.coins < LIFE_COST) return;
    setState((s) => ({ ...s, coins: s.coins - LIFE_COST, lives: s.lives + 1 }));
    playSound("buy");
    loadNext(track, cur.level, cur.recent);
  }

  // Avatar: buy (then equip) or just equip.
  function buyAvatar(item: AvatarItem) {
    setState((s) => {
      if (s.avatar.owned.includes(item.id)) {
        return {
          ...s,
          avatar: {
            ...s.avatar,
            equipped: { ...s.avatar.equipped, [item.category]: item.id },
          },
        };
      }
      if (s.coins < item.cost) return s;
      return {
        ...s,
        coins: s.coins - item.cost,
        avatar: {
          owned: [...s.avatar.owned, item.id],
          equipped: { ...s.avatar.equipped, [item.category]: item.id },
        },
      };
    });
    playSound("buy");
  }

  function equipAvatar(item: AvatarItem) {
    playSound("click");
    setState((s) => ({
      ...s,
      avatar: {
        ...s.avatar,
        equipped: { ...s.avatar.equipped, [item.category]: item.id },
      },
    }));
  }

  const closetModal = closetOpen && (
    <Closet
      coins={state.coins}
      equipped={state.avatar.equipped}
      owned={state.avatar.owned}
      onBuy={buyAvatar}
      onEquip={equipAvatar}
      onClose={() => setClosetOpen(false)}
    />
  );

  function reviveFree() {
    if (!track) return;
    setState((s) => ({
      ...s,
      lives: START_LIVES,
      tracks: {
        ...s.tracks,
        [track]: { ...(s.tracks[track] || EMPTY_TRACK), streak: 0 },
      },
    }));
    loadNext(track, cur.level, cur.recent);
  }

  // ---- Track picker (home) ----
  if (!track) {
    return (
      <main className="game">
        <div className="menu">
          <div className="avatar-frame lg menu-avatar">
            <Avatar equipped={state.avatar.equipped} size={120} />
          </div>
          <h1>CodeQuest</h1>
          <p className="tagline">
            Learn to code by playing. Earn XP, coins, and level up.
          </p>

          <button className="ghost customize" onClick={() => setClosetOpen(true)}>
            🎨 Customize avatar
          </button>

          <div className="wallet-line big">
            <span className="chip">🪙 {state.coins}</span>
            <span className="chip">❤️ {state.lives}</span>
            {state.boost && (
              <span className="chip boost">
                ⚡ {state.boost.mult}× · {state.boost.remaining}
              </span>
            )}
            <button className="shop-btn" onClick={toggleMute} title="Sound">
              {state.muted ? "🔇" : "🔊"}
            </button>
          </div>

          <DailyGoals daily={ensureToday(state.daily)} />

          <div className="track-grid">
            {TRACKS.map((t) => {
              const saved = state.tracks[t.value];
              return (
                <button key={t.value} className="track" onClick={() => start(t.value)}>
                  <span className="track-emoji">{t.emoji}</span>
                  <span className="track-label">{t.label}</span>
                  {saved && saved.solved > 0 && (
                    <span className="track-save">
                      Lv {saved.level} · {saved.solved} solved
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {closetModal}
      </main>
    );
  }

  // ---- Game screen ----
  return (
    <main className="game">
      <header className="hud">
        <div className="hud-row">
          <div className="hud-left">
            <button className="back" onClick={backToMenu} title="Progress is saved">
              ← Menu
            </button>
            <button
              className="avatar-frame hud-avatar"
              onClick={() => setClosetOpen(true)}
              title="Customize avatar"
            >
              <Avatar equipped={state.avatar.equipped} size={34} />
            </button>
          </div>
          <div className="wallet">
            <span className="chip">🪙 {state.coins}</span>
            <span className="chip">❤️ {state.lives}</span>
            <span className="chip">🔥 {cur.streak}</span>
            {state.boost && (
              <span className="chip boost">
                ⚡ {state.boost.mult}× · {state.boost.remaining}
              </span>
            )}
            <button className="shop-btn" onClick={toggleMute} title="Sound">
              {state.muted ? "🔇" : "🔊"}
            </button>
            <button className="shop-btn" onClick={() => setShopOpen(true)}>
              🛒
            </button>
          </div>
        </div>

        <div className="xp">
          <div className="xp-top">
            <span>📈 Level {cur.level}</span>
            <span>
              {cur.xp} / {need} XP
            </span>
          </div>
          <div className="xp-track">
            <div className="xp-fill" style={{ width: `${xpPct}%` }} />
          </div>
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
        Best streak: 🔥 {cur.bestStreak} · Solved: {cur.solved} · progress saves automatically
      </footer>

      {closetModal}

      {shopOpen && (
        <Shop
          coins={state.coins}
          lives={state.lives}
          onBuyLife={buyLife}
          onBuyBoost={buyBoost}
          onClose={() => setShopOpen(false)}
        />
      )}

      {outOfLives && !shopOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-head">
              <h3>💔 Out of lives</h3>
            </div>
            <p className="oo-text">
              You&apos;re at 0 ❤️. Buy a life to keep your 🔥 {cur.streak} streak, or
              start fresh.
            </p>
            <div className="wallet-line">
              <span className="chip">🪙 {state.coins}</span>
            </div>
            <button
              className="buy wide"
              disabled={state.coins < LIFE_COST}
              onClick={reviveWithCoins}
            >
              ❤️ Buy a life — {LIFE_COST} 🪙
            </button>
            <button className="ghost wide" onClick={reviveFree}>
              Start fresh (reset to {START_LIVES} ❤️, lose streak)
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
