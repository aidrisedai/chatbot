"use client";

import { DAILY_GOALS, type Daily } from "@/lib/game";

export function DailyGoals({ daily }: { daily: Daily }) {
  return (
    <div className="daily">
      <div className="daily-head">☀️ Today&apos;s goals</div>
      {DAILY_GOALS.map((g) => {
        const val = daily[g.metric];
        const done = daily.claimed.includes(g.id) || val >= g.target;
        const pct = Math.min(100, Math.round((val / g.target) * 100));
        return (
          <div key={g.id} className={`goal ${done ? "done" : ""}`}>
            <div className="goal-top">
              <span>{g.label}</span>
              <span className="goal-reward">{done ? "✓ done" : `+${g.reward} 🪙`}</span>
            </div>
            <div className="goal-track">
              <div className="goal-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="goal-sub">
              {Math.min(val, g.target)}/{g.target}
            </div>
          </div>
        );
      })}
    </div>
  );
}
