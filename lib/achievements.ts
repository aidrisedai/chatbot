import type { GameState, TrackProgress } from "./game";
import { AVATAR_MAP } from "./avatar";
import { WORLDS } from "./adventure";

export interface Achievement {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  reward: number; // coins
  check: (s: GameState) => boolean;
}

function maxTrack(s: GameState, fn: (t: TrackProgress) => number): number {
  return Object.values(s.tracks).reduce((m, t) => Math.max(m, fn(t)), 0);
}

function totalSolved(s: GameState): number {
  return Object.values(s.tracks).reduce((n, t) => n + t.solved, 0);
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first", name: "First Steps", emoji: "🐣", desc: "Solve your first challenge", reward: 10, check: (s) => totalSolved(s) >= 1 },
  { id: "solver25", name: "Getting Good", emoji: "📘", desc: "Solve 25 challenges", reward: 25, check: (s) => totalSolved(s) >= 25 },
  { id: "solver100", name: "Code Machine", emoji: "💻", desc: "Solve 100 challenges", reward: 60, check: (s) => totalSolved(s) >= 100 },
  { id: "streak5", name: "On Fire", emoji: "🔥", desc: "Reach a 5× streak", reward: 20, check: (s) => maxTrack(s, (t) => t.bestStreak) >= 5 },
  { id: "streak10", name: "Unstoppable", emoji: "⚡", desc: "Reach a 10× streak", reward: 40, check: (s) => maxTrack(s, (t) => t.bestStreak) >= 10 },
  { id: "level5", name: "Rising Star", emoji: "⭐", desc: "Reach level 5 in a language", reward: 30, check: (s) => maxTrack(s, (t) => t.level) >= 5 },
  { id: "level10", name: "Prodigy", emoji: "🌟", desc: "Reach level 10 in a language", reward: 60, check: (s) => maxTrack(s, (t) => t.level) >= 10 },
  { id: "rich", name: "Moneybags", emoji: "🪙", desc: "Hold 100 coins", reward: 15, check: (s) => s.coins >= 100 },
  { id: "boss1", name: "Giant Slayer", emoji: "⚔️", desc: "Clear an Adventure world", reward: 25, check: (s) => s.adventure.cleared.length >= 1 },
  { id: "bossAll", name: "Legend", emoji: "🏆", desc: "Clear every Adventure world", reward: 100, check: (s) => s.adventure.cleared.length >= WORLDS.length },
  { id: "collector", name: "Fashionista", emoji: "🎨", desc: "Own 5 paid cosmetics", reward: 30, check: (s) => s.avatar.owned.filter((id) => (AVATAR_MAP[id]?.cost ?? 0) > 0).length >= 5 },
];

export function pendingAchievements(s: GameState): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !s.achievements.includes(a.id) && a.check(s));
}
