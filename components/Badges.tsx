"use client";

import { ACHIEVEMENTS } from "@/lib/achievements";

export function Badges({
  unlocked,
  onClose,
}: {
  unlocked: string[];
  onClose: () => void;
}) {
  const count = unlocked.length;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal closet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>🏅 Badges</h3>
          <div className="wallet-line">
            <span className="chip">
              {count}/{ACHIEVEMENTS.length}
            </span>
            <button className="modal-x" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="badge-grid">
          {ACHIEVEMENTS.map((a) => {
            const got = unlocked.includes(a.id);
            return (
              <div key={a.id} className={`badge-card ${got ? "got" : "locked"}`}>
                <span className="badge-emoji">{got ? a.emoji : "🔒"}</span>
                <div className="badge-info">
                  <div className="badge-name">{a.name}</div>
                  <div className="badge-desc">{a.desc}</div>
                </div>
                <span className="badge-reward">{got ? "✓" : `+${a.reward}🪙`}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
