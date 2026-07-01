"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import {
  AVATAR_CATEGORIES,
  AVATAR_ITEMS,
  type AvatarCategory,
  type AvatarItem,
} from "@/lib/avatar";

export function Closet({
  coins,
  equipped,
  owned,
  onBuy,
  onEquip,
  onClose,
}: {
  coins: number;
  equipped: Record<AvatarCategory, string>;
  owned: string[];
  onBuy: (item: AvatarItem) => void;
  onEquip: (item: AvatarItem) => void;
  onClose: () => void;
}) {
  const [cat, setCat] = useState<AvatarCategory>("background");
  const items = AVATAR_ITEMS.filter((i) => i.category === cat);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal closet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>🎨 Customize</h3>
          <div className="wallet-line">
            <span className="chip">🪙 {coins}</span>
            <button className="modal-x" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="closet-preview">
          <div className="avatar-frame lg">
            <Avatar equipped={equipped} size={140} />
          </div>
        </div>

        <div className="tabs">
          {AVATAR_CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`tab ${cat === c.key ? "active" : ""}`}
              onClick={() => setCat(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="item-grid">
          {items.map((item) => {
            const isOwned = owned.includes(item.id);
            const isEquipped = equipped[item.category] === item.id;
            const preview = { ...equipped, [item.category]: item.id };
            const canAfford = coins >= item.cost;
            return (
              <div key={item.id} className={`item ${isEquipped ? "equipped" : ""}`}>
                <div className="avatar-frame sm">
                  <Avatar equipped={preview} size={64} />
                </div>
                <div className="item-name">{item.name}</div>
                {isEquipped ? (
                  <div className="item-badge on">Equipped</div>
                ) : isOwned ? (
                  <button className="item-btn equip" onClick={() => onEquip(item)}>
                    Equip
                  </button>
                ) : (
                  <button
                    className="item-btn"
                    disabled={!canAfford}
                    onClick={() => onBuy(item)}
                  >
                    {item.cost} 🪙
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
