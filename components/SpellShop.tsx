"use client";

import {
  ATTACKS,
  SPELL_MAX_LEVEL,
  spellDamage,
  spellUpgradeCost,
} from "@/lib/adventure";

export function SpellShop({
  coins,
  owned,
  levels,
  onBuy,
  onUpgrade,
  onClose,
}: {
  coins: number;
  owned: string[];
  levels: Record<string, number>;
  onBuy: (id: string) => void;
  onUpgrade: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>🔮 Spellbook</h3>
          <div className="wallet-line">
            <span className="chip">🪙 {coins}</span>
            <button className="modal-x" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {ATTACKS.map((a) => {
          const isOwned = owned.includes(a.id);
          const level = levels[a.id] || 0;
          const maxed = level >= SPELL_MAX_LEVEL;
          const upCost = spellUpgradeCost(level);
          return (
            <div className="shop-item" key={a.id}>
              <div>
                <div className="shop-name">
                  {a.emoji} {a.name} · {spellDamage(a, level)} dmg
                </div>
                <div className="shop-desc">
                  {a.cooldown === 0 ? "no cooldown" : `${a.cooldown}-turn cooldown`}
                  {isOwned && level > 0 ? ` · Lv ${level}` : ""}
                </div>
              </div>
              {!isOwned ? (
                <button
                  className="buy"
                  disabled={coins < a.cost}
                  onClick={() => onBuy(a.id)}
                >
                  {a.cost} 🪙
                </button>
              ) : maxed ? (
                <button className="buy" disabled>
                  MAX
                </button>
              ) : (
                <button
                  className="buy"
                  disabled={coins < upCost}
                  onClick={() => onUpgrade(a.id)}
                >
                  ⬆ {upCost} 🪙
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
