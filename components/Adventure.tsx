"use client";

import { useCallback, useState } from "react";
import { ChallengeCard } from "@/components/ChallengeCard";
import { Avatar } from "@/components/Avatar";
import type { Challenge } from "@/lib/types";
import type { AvatarCategory } from "@/lib/avatar";
import { playSound } from "@/lib/sound";
import {
  WORLDS,
  isWorldUnlocked,
  PLAYER_MAX_HP,
  PLAYER_DMG,
  STREAK_DMG,
  HEAL_BETWEEN,
  MONSTER_COINS,
  BOSS_COINS,
  type WorldDef,
} from "@/lib/adventure";

type Phase = "map" | "battle" | "lost" | "failed" | "cleared";

const LEVEL_HEARTS = 3;

type Foe = {
  name: string;
  emoji: string;
  hp: number;
  maxHp: number;
  dmg: number;
  boss: boolean;
};

function HpBar({ hp, max }: { hp: number; max: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((hp / max) * 100)));
  const color = pct > 50 ? "#43d17a" : pct > 25 ? "#f2c14e" : "#ff6b6b";
  return (
    <div className="hpbar">
      <div className="hpbar-fill" style={{ width: `${pct}%`, background: color }} />
      <span className="hpbar-label">
        {Math.max(0, hp)} / {max}
      </span>
    </div>
  );
}

export function Adventure({
  equipped,
  cleared,
  onClearWorld,
  onReward,
  onExit,
}: {
  equipped: Record<AvatarCategory, string>;
  cleared: string[];
  onClearWorld: (id: string) => void;
  onReward: (coins: number) => void;
  onExit: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("map");
  const [world, setWorld] = useState<WorldDef | null>(null);
  const [encounterIndex, setEncounterIndex] = useState(0);
  const [foe, setFoe] = useState<Foe | null>(null);
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [hearts, setHearts] = useState(LEVEL_HEARTS);
  const [streak, setStreak] = useState(0);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [turnId, setTurnId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [battleMsg, setBattleMsg] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  const nextTurn = useCallback(
    async (w: WorldDef, seen: string[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            track: w.topic,
            level: w.level,
            recent: seen,
            kind: "quick",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to summon a challenge.");
        const c = data as Challenge;
        setChallenge(c);
        setTurnId((t) => t + 1);
        setRecent((prev) => [...prev, c.concept].slice(-8));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  function beginEncounter(w: WorldDef, idx: number, seen: string[]) {
    const e = w.encounters[idx];
    setFoe({
      name: e.name,
      emoji: e.emoji,
      hp: e.hp,
      maxHp: e.hp,
      dmg: e.dmg,
      boss: !!e.boss,
    });
    setStreak(0);
    setBattleMsg(e.boss ? `⚔️ Boss battle: ${e.name}!` : `A wild ${e.name} appears!`);
    setChallenge(null);
    nextTurn(w, seen);
  }

  function openWorld(w: WorldDef) {
    playSound("click");
    setWorld(w);
    setEncounterIndex(0);
    setPlayerHp(PLAYER_MAX_HP);
    setHearts(LEVEL_HEARTS);
    setRecent([]);
    setPhase("battle");
    beginEncounter(w, 0, []);
  }

  function onAnswer(correct: boolean) {
    if (!foe) return;
    if (correct) {
      const dmg = PLAYER_DMG + streak * STREAK_DMG;
      const newFoeHp = Math.max(0, foe.hp - dmg);
      setFoe((f) => (f ? { ...f, hp: newFoeHp } : f));
      setStreak((s) => s + 1);
      if (newFoeHp > 0) {
        // The creature fights back — a glancing blow since you landed your hit.
        const counter = Math.max(1, Math.round(foe.dmg * 0.5));
        setPlayerHp((hp) => Math.max(0, hp - counter));
        setBattleMsg(`🗡️ You hit ${foe.name} for ${dmg}! It strikes back for ${counter}.`);
      } else {
        setBattleMsg(`🗡️ You hit ${foe.name} for ${dmg} — defeated!`);
      }
      playSound("correct");
    } else {
      // Miss — the creature lands a full hit.
      setPlayerHp((hp) => Math.max(0, hp - foe.dmg));
      setStreak(0);
      setBattleMsg(`💥 You missed! ${foe.name} hits you for ${foe.dmg}!`);
      playSound("wrong");
    }
  }

  function onNext() {
    if (!world || !foe) return;
    if (foe.hp <= 0) {
      // Win this encounter
      if (foe.boss) {
        onReward(BOSS_COINS);
        onClearWorld(world.id);
        playSound("levelUp");
        setPhase("cleared");
      } else {
        onReward(MONSTER_COINS);
        playSound("coin");
        const nextIdx = encounterIndex + 1;
        setEncounterIndex(nextIdx);
        setPlayerHp((hp) => Math.min(PLAYER_MAX_HP, hp + HEAL_BETWEEN));
        beginEncounter(world, nextIdx, recent);
      }
    } else if (playerHp <= 0) {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      playSound("wrong");
      setPhase(newHearts <= 0 ? "failed" : "lost");
    } else {
      nextTurn(world, recent);
    }
  }

  function retryEncounter() {
    if (!world) return;
    setPlayerHp(PLAYER_MAX_HP);
    setPhase("battle");
    beginEncounter(world, encounterIndex, recent);
  }

  function restartLevel() {
    if (!world) return;
    setHearts(LEVEL_HEARTS);
    setEncounterIndex(0);
    setPlayerHp(PLAYER_MAX_HP);
    setRecent([]);
    setPhase("battle");
    beginEncounter(world, 0, []);
  }

  function toMap() {
    setPhase("map");
    setWorld(null);
    setFoe(null);
    setChallenge(null);
  }

  // ---------- Map ----------
  if (phase === "map") {
    return (
      <main className="game">
        <div className="adv-head">
          <button className="back" onClick={onExit}>
            ← Menu
          </button>
          <h1 className="adv-title">⚔️ Adventure</h1>
          <span style={{ width: 60 }} />
        </div>
        <p className="tagline" style={{ textAlign: "center" }}>
          Journey through worlds. Cast spells by solving code. Beat the boss to unlock
          the next land.
        </p>
        <div className="world-list">
          {WORLDS.map((w, i) => {
            const unlocked = isWorldUnlocked(i, cleared);
            const done = cleared.includes(w.id);
            return (
              <button
                key={w.id}
                className={`world-card ${unlocked ? "" : "locked"}`}
                style={unlocked ? { borderColor: w.color } : undefined}
                disabled={!unlocked}
                onClick={() => openWorld(w)}
              >
                <span className="world-emoji">{unlocked ? w.emoji : "🔒"}</span>
                <span className="world-body">
                  <span className="world-name">
                    {w.name} {done && "✓"}
                  </span>
                  <span className="world-quest">
                    {unlocked ? w.quest : `Clear ${WORLDS[i - 1].name} to unlock`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </main>
    );
  }

  // ---------- Cleared / Lost overlays ----------
  if (phase === "cleared" && world) {
    return (
      <main className="game">
        <div className="adv-result">
          <div className="big-emoji">🏆</div>
          <h1>{world.name} cleared!</h1>
          <p>You defeated the {world.encounters[world.encounters.length - 1].name} and earned {BOSS_COINS} 🪙.</p>
          <button className="next-btn" onClick={toMap}>
            Back to map →
          </button>
        </div>
      </main>
    );
  }

  if (phase === "lost") {
    return (
      <main className="game">
        <div className="adv-result">
          <div className="big-emoji">💔</div>
          <h1>You fell in battle!</h1>
          <p>
            You lost a heart. {"❤️".repeat(hearts)}
            {"🤍".repeat(Math.max(0, LEVEL_HEARTS - hearts))} — {hearts} left.
            Retry this fight with full health.
          </p>
          <div className="adv-result-actions">
            <button className="next-btn" onClick={retryEncounter}>
              Try again
            </button>
            <button className="ghost" onClick={toMap}>
              Flee to map
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (phase === "failed" && world) {
    return (
      <main className="game">
        <div className="adv-result">
          <div className="big-emoji">💀</div>
          <h1>Out of hearts!</h1>
          <p>
            You&apos;ve lost all {LEVEL_HEARTS} hearts and must restart {world.name}
            from the beginning. Cleared worlds stay cleared.
          </p>
          <div className="adv-result-actions">
            <button className="next-btn" onClick={restartLevel}>
              Restart level
            </button>
            <button className="ghost" onClick={toMap}>
              Back to map
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ---------- Battle ----------
  return (
    <main className="game">
      <div className="adv-head">
        <button className="back" onClick={toMap}>
          ← Flee
        </button>
        <h1 className="adv-title">{world?.emoji} {world?.name}</h1>
        <span className="adv-hearts" title="Hearts">
          {"❤️".repeat(hearts)}
          {"🤍".repeat(Math.max(0, LEVEL_HEARTS - hearts))}
        </span>
      </div>

      {foe && (
        <div className="combatant foe">
          <div className={`foe-sprite ${foe.boss ? "boss" : ""}`}>{foe.emoji}</div>
          <div className="combatant-info">
            <div className="combatant-name">
              {foe.name} {foe.boss && "👑"}
            </div>
            <HpBar hp={foe.hp} max={foe.maxHp} />
          </div>
        </div>
      )}

      {battleMsg && <div className="battle-msg">{battleMsg}</div>}

      <div className="stage">
        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>Summoning a challenge…</p>
          </div>
        )}
        {!loading && error && (
          <div className="error-box">
            <p>⚠️ {error}</p>
            <button className="next-btn" onClick={() => world && nextTurn(world, recent)}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && challenge && (
          <ChallengeCard
            key={turnId}
            challenge={challenge}
            onResult={onAnswer}
            onNext={onNext}
          />
        )}
      </div>

      <div className="combatant hero">
        <div className="avatar-frame sm hero-sprite">
          <Avatar equipped={equipped} size={56} />
        </div>
        <div className="combatant-info">
          <div className="combatant-name">You {streak > 1 && `· 🔥 ${streak}`}</div>
          <HpBar hp={playerHp} max={PLAYER_MAX_HP} />
        </div>
      </div>
    </main>
  );
}
