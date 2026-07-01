import { defaultAvatar, type AvatarConfig } from "./avatar";

// ---- Economy constants ----
export const START_LIVES = 3;
export const MAX_LIVES = 5;
export const LIFE_COST = 20;
export const BOOST_DURATION = 10; // challenges a boost lasts
export const BASE_XP = 10; // XP per correct answer (before boost)

export const BOOSTS: { mult: number; cost: number; label: string }[] = [
  { mult: 1.5, cost: 30, label: "1.5×" },
  { mult: 2, cost: 60, label: "2×" },
  { mult: 3, cost: 120, label: "3×" },
];

// ---- Types ----
export type Boost = { mult: number; remaining: number } | null;

export type TrackProgress = {
  level: number;
  xp: number; // progress toward the next level
  streak: number;
  bestStreak: number;
  solved: number;
  recent: string[];
};

export const EMPTY_TRACK: TrackProgress = {
  level: 1,
  xp: 0,
  streak: 0,
  bestStreak: 0,
  solved: 0,
  recent: [],
};

export type DailyMetric = "solved" | "xp" | "bestStreak";

export type Daily = {
  date: string;
  solved: number;
  xp: number;
  bestStreak: number;
  claimed: string[];
};

export type GameState = {
  coins: number;
  lives: number;
  boost: Boost;
  daily: Daily;
  tracks: Record<string, TrackProgress>;
  avatar: AvatarConfig;
  muted: boolean;
};

export const DAILY_GOALS: {
  id: string;
  label: string;
  metric: DailyMetric;
  target: number;
  reward: number;
}[] = [
  { id: "solve", label: "Solve 10 challenges", metric: "solved", target: 10, reward: 40 },
  { id: "xp", label: "Earn 150 XP", metric: "xp", target: 150, reward: 30 },
  { id: "streak", label: "Reach a 6× streak", metric: "bestStreak", target: 6, reward: 25 },
];

// ---- Helpers ----
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function freshDaily(): Daily {
  return { date: todayStr(), solved: 0, xp: 0, bestStreak: 0, claimed: [] };
}

export function ensureToday(daily: Daily | undefined): Daily {
  if (!daily || daily.date !== todayStr()) return freshDaily();
  return daily;
}

export function defaultState(): GameState {
  return {
    coins: 0,
    lives: START_LIVES,
    boost: null,
    daily: freshDaily(),
    tracks: {},
    avatar: defaultAvatar(),
    muted: false,
  };
}

// XP needed to reach the next level — grows each level.
export function xpToNext(level: number): number {
  return 50 + (level - 1) * 30;
}

// Coins awarded on leveling up — bigger than a single answer, grows with level.
export function levelUpCoins(level: number): number {
  return 15 + level * 3;
}

/**
 * Apply the outcome of one answer to the whole game state.
 * Handles XP, level-ups, coins, lives, streaks, boosts, and daily-goal rewards.
 */
export function applyAnswer(
  state: GameState,
  track: string,
  correct: boolean,
  roll: number, // a 0..1 random value, injected so the caller controls randomness
  weight = 1 // harder challenges (write_code, mini_project) award more
): GameState {
  const t = state.tracks[track] || EMPTY_TRACK;
  let { coins, lives } = state;
  let boost = state.boost;
  let daily = ensureToday(state.daily);
  const mult = boost ? boost.mult : 1;

  const nt: TrackProgress = { ...t };

  if (correct) {
    const xpGain = Math.round(BASE_XP * mult * weight);
    const baseCoins = 1 + Math.floor(roll * 2); // 1 or 2
    const coinGain = Math.round(baseCoins * mult * weight);

    nt.streak = t.streak + 1;
    nt.bestStreak = Math.max(t.bestStreak, nt.streak);
    nt.solved = t.solved + 1;
    nt.xp = t.xp + xpGain;

    // Level up (possibly more than once) and pay level-up coins.
    while (nt.xp >= xpToNext(nt.level)) {
      nt.xp -= xpToNext(nt.level);
      nt.level += 1;
      coins += Math.round(levelUpCoins(nt.level) * mult);
    }

    coins += coinGain;
    daily = {
      ...daily,
      solved: daily.solved + 1,
      xp: daily.xp + xpGain,
      bestStreak: Math.max(daily.bestStreak, nt.streak),
    };
  } else {
    lives = Math.max(0, lives - 1);
    nt.streak = 0;
  }

  // A boost is consumed one charge per answered challenge.
  if (boost) {
    const remaining = boost.remaining - 1;
    boost = remaining > 0 ? { ...boost, remaining } : null;
  }

  // Grant any daily-goal rewards that just completed.
  const claimed = [...daily.claimed];
  for (const g of DAILY_GOALS) {
    if (!claimed.includes(g.id) && daily[g.metric] >= g.target) {
      claimed.push(g.id);
      coins += g.reward;
    }
  }
  daily = { ...daily, claimed };

  return {
    coins,
    lives,
    boost,
    daily,
    tracks: { ...state.tracks, [track]: nt },
    avatar: state.avatar,
    muted: state.muted,
  };
}
