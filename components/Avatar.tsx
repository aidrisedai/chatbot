"use client";

import {
  AVATAR_MAP,
  DEFAULT_EQUIPPED,
  type AvatarCategory,
} from "@/lib/avatar";

// The avatar is real pixel art: a 16x16 grid where every feature is drawn
// from 1x1 square "pixels". Layers are composed from the equipped items.

const DARK = "#20263a";
const GRID = 16;

type Cell = { x: number; y: number; c: string };

function wingCells(style: string): Cell[] {
  const a: Cell[] = [];
  const add = (x: number, y: number, c: string) => a.push({ x, y, c });
  switch (style) {
    case "angel": {
      const w = "#eef2ff";
      [[2, 8], [1, 9], [2, 9], [3, 9], [1, 10], [2, 10], [3, 10], [2, 11]].forEach(
        ([x, y]) => add(x, y, w)
      );
      break;
    }
    case "bat": {
      const w = "#2c2540";
      [[2, 8], [1, 9], [2, 9], [3, 9], [0, 10], [1, 10], [2, 10], [2, 11]].forEach(
        ([x, y]) => add(x, y, w)
      );
      break;
    }
    case "butterfly": {
      [[1, 8], [2, 8], [1, 9], [2, 9], [3, 9]].forEach(([x, y]) => add(x, y, "#ff77b7"));
      [[1, 11], [2, 11], [3, 11], [2, 12]].forEach(([x, y]) => add(x, y, "#8a6bff"));
      break;
    }
    case "flame": {
      add(2, 8, "#ffcf5c");
      [[1, 9], [2, 9], [3, 9], [1, 10], [2, 10]].forEach(([x, y]) => add(x, y, "#ff8a3d"));
      add(2, 11, "#ffcf5c");
      break;
    }
  }
  return a;
}

function hairCells(style: string, color: string): Cell[] {
  const a: Cell[] = [];
  const add = (x: number, y: number) => a.push({ x, y, c: color });
  const r = (x0: number, x1: number, y0: number, y1: number) => {
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) add(x, y);
  };
  switch (style) {
    case "short":
      r(5, 10, 1, 2);
      add(5, 3);
      add(10, 3);
      break;
    case "long":
      r(5, 10, 1, 2);
      add(5, 3);
      add(10, 3);
      r(4, 4, 3, 8);
      r(11, 11, 3, 8);
      break;
    case "bun":
      r(5, 10, 1, 2);
      add(5, 3);
      add(10, 3);
      add(7, 0);
      add(8, 0);
      break;
    case "spiky":
      r(5, 10, 1, 2);
      add(5, 0);
      add(7, 0);
      add(9, 0);
      break;
    case "afro":
      r(4, 11, 0, 2);
      r(4, 4, 3, 5);
      r(11, 11, 3, 5);
      break;
    case "mohawk":
      r(7, 8, 0, 2);
      break;
  }
  return a;
}

function glassCells(style: string): Cell[] {
  const a: Cell[] = [];
  const add = (x: number, y: number, c: string) => a.push({ x, y, c });
  switch (style) {
    case "round":
      [[5, 4], [7, 4], [8, 4], [10, 4]].forEach(([x, y]) => add(x, y, DARK));
      break;
    case "square":
      [[5, 4], [7, 4], [8, 4], [10, 4], [6, 3], [9, 3]].forEach(([x, y]) => add(x, y, DARK));
      add(6, 4, "#b9c2e0");
      add(9, 4, "#b9c2e0");
      break;
    case "sun":
      for (let x = 5; x <= 10; x++) add(x, 4, DARK);
      break;
    case "star":
      [[5, 4], [7, 4], [8, 4], [10, 4]].forEach(([x, y]) => add(x, y, "#ff5aa0"));
      add(6, 4, "#ff9dcb");
      add(9, 4, "#ff9dcb");
      break;
  }
  return a;
}

export function Avatar({
  equipped,
  size = 120,
}: {
  equipped: Record<AvatarCategory, string>;
  size?: number;
}) {
  const get = (cat: AvatarCategory) =>
    AVATAR_MAP[equipped[cat]] ?? AVATAR_MAP[DEFAULT_EQUIPPED[cat]];

  const bg = get("background");
  const skin = get("skin").color!;
  const hair = get("hairColor").color!;
  const hairStyle = get("hairStyle").style!;
  const top = get("top");
  const bottom = get("bottom").color!;
  const glasses = get("glasses").style!;
  const wings = get("wings").style!;

  const cells: Cell[] = [];
  const set = (x: number, y: number, c: string) => cells.push({ x, y, c });
  const rect = (
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    c: string | ((x: number) => string)
  ) => {
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++) set(x, y, typeof c === "function" ? c(x) : c);
  };

  // Background (simple 2-band vertical gradient) + optional stars
  rect(0, 15, 0, 15, bg.color!);
  if (bg.color2) rect(0, 15, 0, 6, bg.color2);
  if (bg.style === "stars")
    ([[2, 2], [12, 3], [4, 12], [13, 10], [8, 1], [11, 13], [5, 6]] as const).forEach(
      ([x, y]) => set(x, y, "#ffffff")
    );

  // Wings (behind the body), mirrored across the center
  wingCells(wings).forEach(({ x, y, c }) => {
    set(x, y, c);
    set(15 - x, y, c);
  });

  // Body: pants, shoes, torso, sleeves, hands
  rect(5, 10, 13, 15, bottom);
  ([[5, 15], [6, 15], [9, 15], [10, 15]] as const).forEach(([x, y]) => set(x, y, DARK));
  const topColor = (x: number) =>
    top.color2 ? (x % 2 ? top.color2! : top.color!) : top.color!;
  rect(4, 11, 9, 12, topColor);
  ([[3, 9], [3, 10], [12, 9], [12, 10]] as const).forEach(([x, y]) =>
    set(x, y, topColor(x))
  );
  ([[3, 11], [12, 11]] as const).forEach(([x, y]) => set(x, y, skin));

  // Head, ears, neck
  rect(5, 10, 2, 7, skin);
  ([[4, 4], [4, 5], [11, 4], [11, 5]] as const).forEach(([x, y]) => set(x, y, skin));
  ([[7, 8], [8, 8]] as const).forEach(([x, y]) => set(x, y, skin));

  // Hair
  hairCells(hairStyle, hair).forEach(({ x, y, c }) => set(x, y, c));

  // Face: eyes, cheeks, mouth
  set(6, 4, DARK);
  set(9, 4, DARK);
  set(5, 5, "#ff9db0");
  set(10, 5, "#ff9db0");
  set(7, 6, DARK);
  set(8, 6, DARK);

  // Glasses over the eyes
  glassCells(glasses).forEach(({ x, y, c }) => set(x, y, c));

  const px = 1.03; // slight overlap avoids hairline seams between pixels

  return (
    <svg
      viewBox={`0 0 ${GRID} ${GRID}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Your pixel avatar"
    >
      {cells.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={px} height={px} fill={c.c} />
      ))}
    </svg>
  );
}
