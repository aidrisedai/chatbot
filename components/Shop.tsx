"use client";

import { BOOSTS, BOOST_DURATION, LIFE_COST, MAX_LIVES } from "@/lib/game";

export function Shop({
  coins,
  lives,
  onBuyLife,
  onBuyBoost,
  onClose,
}: {
  coins: number;
  lives: number;
  onBuyLife: () => void;
  onBuyBoost: (mult: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>🛒 Shop</h3>
          <button className="modal-x" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="wallet-line">
          <span className="chip">🪙 {coins}</span>
          <span className="chip">❤️ {lives}</span>
        </div>

        <div className="shop-item">
          <div>
            <div className="shop-name">❤️ Extra life</div>
            <div className="shop-desc">
              {lives >= MAX_LIVES ? `Full (max ${MAX_LIVES})` : `+1 life · max ${MAX_LIVES}`}
            </div>
          </div>
          <button
            className="buy"
            disabled={coins < LIFE_COST || lives >= MAX_LIVES}
            onClick={onBuyLife}
          >
            {LIFE_COST} 🪙
          </button>
        </div>

        <div className="shop-section">⚡ Boosts — multiply XP & coins</div>
        {BOOSTS.map((b) => (
          <div className="shop-item" key={b.mult}>
            <div>
              <div className="shop-name">⚡ {b.label} boost</div>
              <div className="shop-desc">Next {BOOST_DURATION} challenges</div>
            </div>
            <button
              className="buy"
              disabled={coins < b.cost}
              onClick={() => onBuyBoost(b.mult)}
            >
              {b.cost} 🪙
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
