"use client";

import {
  AVATAR_MAP,
  DEFAULT_EQUIPPED,
  type AvatarCategory,
} from "@/lib/avatar";

// Pixel-art avatar on a 32x32 grid (finer pixels, sprite-style). Every feature
// is built from 1x1 square pixels; a silhouette outline and light shading are
// added automatically for a crisp, Habitica-like look.

const GRID = 32;
const DARK = "#20263a";
const OUTLINE = "#12131f";

type Cell = { x: number; y: number; c: string; o?: number };

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

  const bgCells: Cell[] = [];
  const sil: Cell[] = []; // silhouette (opaque body) — gets the outline
  const face: Cell[] = [];
  const glass: Cell[] = [];
  const overlay: Cell[] = [];
  const occ = new Set<string>();

  const inGrid = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < GRID && y < GRID;

  const addSil = (x: number, y: number, c: string) => {
    if (!inGrid(x, y)) return;
    sil.push({ x, y, c });
    occ.add(`${x},${y}`);
  };
  const rectSil = (
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    c: string | ((x: number) => string)
  ) => {
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++) addSil(x, y, typeof c === "function" ? c(x) : c);
  };
  const rectInto = (
    arr: Cell[],
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    c: string,
    o?: number
  ) => {
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++) arr.push({ x, y, c, o });
  };

  // ---- Background (2-band vertical gradient) + stars ----
  rectInto(bgCells, 0, 31, 0, 31, bg.color!);
  if (bg.color2) rectInto(bgCells, 0, 31, 0, 15, bg.color2);
  if (bg.style === "stars")
    (
      [[5, 5], [24, 7], [9, 25], [27, 20], [16, 3], [22, 27], [11, 12], [28, 10]] as const
    ).forEach(([x, y]) => bgCells.push({ x, y, c: "#ffffff" }));

  // ---- Wings (behind body, mirrored) — large ----
  const wingList: Cell[] = [];
  const w = (x: number, y: number, c: string) => wingList.push({ x, y, c });
  if (wings === "angel") {
    const col = "#eef2ff";
    [[8, 11], [7, 12], [8, 12], [6, 13], [7, 13], [8, 13], [5, 14], [6, 14], [7, 14], [8, 14], [4, 15], [5, 15], [6, 15], [7, 15], [8, 15], [3, 16], [4, 16], [5, 16], [6, 16], [7, 16], [8, 16], [2, 17], [3, 17], [4, 17], [5, 17], [6, 17], [7, 17], [8, 17], [1, 18], [2, 18], [3, 18], [4, 18], [5, 18], [6, 18], [7, 18], [8, 18], [2, 19], [3, 19], [4, 19], [5, 19], [6, 19], [7, 19], [8, 19], [3, 20], [4, 20], [5, 20], [6, 20], [7, 20], [8, 20], [4, 21], [5, 21], [6, 21], [7, 21], [8, 21], [5, 22], [6, 22], [7, 22], [8, 22], [6, 23], [7, 23], [8, 23], [7, 24], [8, 24]].forEach(([x, y]) => w(x, y, col));
  } else if (wings === "bat") {
    const col = "#2c2540";
    [[8, 11], [7, 12], [8, 12], [6, 13], [7, 13], [8, 13], [5, 14], [6, 14], [7, 14], [8, 14], [4, 15], [5, 15], [6, 15], [7, 15], [8, 15], [3, 16], [5, 16], [6, 16], [7, 16], [8, 16], [2, 17], [3, 17], [5, 17], [6, 17], [7, 17], [8, 17], [1, 18], [2, 18], [4, 18], [5, 18], [6, 18], [7, 18], [8, 18], [0, 19], [1, 19], [3, 19], [4, 19], [5, 19], [6, 19], [7, 19], [8, 19], [2, 20], [3, 20], [4, 20], [5, 20], [6, 20], [7, 20], [8, 20], [4, 21], [5, 21], [6, 21], [7, 21], [8, 21], [5, 22], [6, 22], [7, 22], [8, 22], [6, 23], [7, 23], [8, 23]].forEach(([x, y]) => w(x, y, col));
  } else if (wings === "butterfly") {
    [[8, 10], [7, 11], [8, 11], [6, 12], [7, 12], [8, 12], [5, 13], [6, 13], [7, 13], [8, 13], [4, 14], [5, 14], [6, 14], [7, 14], [8, 14], [3, 15], [4, 15], [5, 15], [6, 15], [7, 15], [8, 15], [3, 16], [4, 16], [5, 16], [6, 16], [7, 16], [8, 16], [4, 17], [5, 17], [6, 17], [7, 17], [8, 17]].forEach(([x, y]) => w(x, y, "#ff77b7"));
    [[5, 20], [6, 20], [7, 20], [8, 20], [4, 21], [5, 21], [6, 21], [7, 21], [8, 21], [5, 22], [6, 22], [7, 22], [8, 22], [6, 23], [7, 23], [8, 23], [7, 24], [8, 24]].forEach(([x, y]) => w(x, y, "#8a6bff"));
    w(5, 14, "#ffffff");
    w(6, 21, "#ffffff");
  } else if (wings === "flame") {
    [[8, 12], [7, 13], [8, 13], [6, 14], [7, 14], [8, 14], [5, 15], [6, 15], [7, 15], [8, 15], [4, 16], [5, 16], [6, 16], [7, 16], [8, 16], [3, 17], [4, 17], [5, 17], [6, 17], [7, 17], [8, 17], [4, 18], [5, 18], [6, 18], [7, 18], [8, 18], [5, 19], [6, 19], [7, 19], [8, 19], [6, 20], [7, 20], [8, 20], [7, 21], [8, 21]].forEach(([x, y]) => w(x, y, "#ff8a3d"));
    [[8, 14], [7, 15], [8, 15], [7, 16], [8, 16], [6, 17], [7, 17], [8, 17], [7, 18], [8, 18], [8, 19]].forEach(([x, y]) => w(x, y, "#ffcf5c"));
  }
  wingList.forEach(({ x, y, c }) => {
    addSil(x, y, c);
    addSil(31 - x, y, c);
  });

  // ---- Body ----
  const topColor = (x: number) =>
    top.color2 ? (x % 2 ? top.color2! : top.color!) : top.color!;
  rectSil(10, 14, 26, 31, bottom); // left leg
  rectSil(17, 21, 26, 31, bottom); // right leg
  rectSil(10, 14, 30, 31, DARK); // left shoe
  rectSil(17, 21, 30, 31, DARK); // right shoe
  rectSil(8, 23, 18, 25, topColor); // torso
  rectSil(6, 7, 18, 22, topColor); // left sleeve
  rectSil(24, 25, 18, 22, topColor); // right sleeve
  rectSil(6, 7, 23, 24, skin); // left hand
  rectSil(24, 25, 23, 24, skin); // right hand

  // ---- Head, ears, neck ----
  rectSil(14, 17, 16, 17, skin); // neck
  rectSil(10, 21, 4, 15, skin); // head
  rectSil(8, 9, 9, 12, skin); // left ear
  rectSil(22, 23, 9, 12, skin); // right ear

  // ---- Hair ----
  const r = (x0: number, x1: number, y0: number, y1: number) => rectSil(x0, x1, y0, y1, hair);
  const pts = (list: number[][]) => list.forEach(([x, y]) => addSil(x, y, hair));
  switch (hairStyle) {
    case "short":
      r(9, 22, 2, 4);
      r(9, 10, 5, 8);
      r(21, 22, 5, 8);
      r(11, 20, 5, 5);
      break;
    case "long":
      r(9, 22, 2, 4);
      r(8, 10, 5, 20);
      r(21, 23, 5, 20);
      r(11, 20, 5, 5);
      break;
    case "bun":
      r(9, 22, 2, 4);
      r(9, 10, 5, 8);
      r(21, 22, 5, 8);
      r(14, 17, 0, 2);
      break;
    case "spiky":
      r(9, 22, 4, 5);
      pts([[10, 1], [10, 2], [10, 3], [13, 0], [13, 1], [13, 2], [13, 3], [16, 1], [16, 2], [16, 3], [19, 0], [19, 1], [19, 2], [19, 3], [21, 1], [21, 2], [21, 3]]);
      break;
    case "afro":
      r(7, 24, 1, 5);
      r(6, 7, 5, 12);
      r(24, 25, 5, 12);
      r(8, 23, 0, 2);
      break;
    case "mohawk":
      r(14, 17, 0, 5);
      break;
  }

  // ---- Pet (sits at the lower-left, in front of the wings) ----
  const pet = get("pets").style!;
  if (pet && pet !== "none") {
    const petColor =
      ({
        cat: "#8a93b0",
        dog: "#b07a4a",
        bunny: "#eef2ff",
        fox: "#e0844e",
        dragon: "#43d17a",
        robot: "#b9c2e0",
      } as Record<string, string>)[pet] || "#8a93b0";
    rectSil(2, 7, 28, 31, petColor); // body
    rectSil(2, 6, 25, 27, petColor); // head
    addSil(1, 29, petColor); // tail
    addSil(1, 30, petColor);
    if (pet === "cat" || pet === "fox") {
      [[2, 23], [2, 24], [6, 23], [6, 24]].forEach(([x, y]) => addSil(x, y, petColor));
    } else if (pet === "dog") {
      [[1, 25], [1, 26], [7, 25], [7, 26]].forEach(([x, y]) => addSil(x, y, petColor));
    } else if (pet === "bunny") {
      [[2, 22], [2, 23], [2, 24], [5, 22], [5, 23], [5, 24]].forEach(([x, y]) => addSil(x, y, petColor));
    } else if (pet === "dragon") {
      [[2, 23], [2, 24], [6, 23], [6, 24]].forEach(([x, y]) => addSil(x, y, petColor));
      addSil(4, 23, "#2f9d5b");
      addSil(8, 29, petColor); // spiky tail tip
    } else if (pet === "robot") {
      addSil(4, 22, petColor);
      addSil(4, 23, petColor);
    }
    // pet face (interior)
    face.push({ x: 3, y: 26, c: DARK });
    face.push({ x: 5, y: 26, c: DARK });
    if (pet === "fox") {
      face.push({ x: 3, y: 27, c: "#ffffff" });
      face.push({ x: 5, y: 27, c: "#ffffff" });
    }
  }

  // ---- Face ----
  rectInto(face, 12, 13, 9, 10, DARK); // left eye
  rectInto(face, 18, 19, 9, 10, DARK); // right eye
  face.push({ x: 12, y: 9, c: "#ffffff" });
  face.push({ x: 18, y: 9, c: "#ffffff" });
  rectInto(face, 10, 11, 12, 12, "#ff9db0"); // cheeks
  rectInto(face, 20, 21, 12, 12, "#ff9db0");
  [[13, 14], [18, 14], [14, 15], [15, 15], [16, 15], [17, 15]].forEach(([x, y]) =>
    face.push({ x, y, c: DARK })
  ); // smile

  // ---- Glasses ----
  const ring = (bx0: number, bx1: number, by0: number, by1: number, c: string) => {
    for (let x = bx0; x <= bx1; x++) {
      glass.push({ x, y: by0, c });
      glass.push({ x, y: by1, c });
    }
    for (let y = by0; y <= by1; y++) {
      glass.push({ x: bx0, y, c });
      glass.push({ x: bx1, y, c });
    }
  };
  if (glasses !== "none") {
    const frame = glasses === "star" ? "#ff5aa0" : DARK;
    ring(11, 14, 8, 11, frame);
    ring(17, 20, 8, 11, frame);
    glass.push({ x: 15, y: 9, c: frame });
    glass.push({ x: 16, y: 9, c: frame });
    if (glasses === "round" || glasses === "sun") {
      glass.push({ x: 10, y: 9, c: frame });
      glass.push({ x: 21, y: 9, c: frame });
    }
    const lens =
      glasses === "square"
        ? "#b9c2e0"
        : glasses === "sun"
        ? DARK
        : glasses === "star"
        ? "#ff9dcb"
        : null;
    if (lens) {
      rectInto(glass, 12, 13, 9, 10, lens);
      rectInto(glass, 18, 19, 9, 10, lens);
    }
  }

  // ---- Shading / highlight overlays ----
  rectInto(overlay, 8, 23, 24, 25, "#000000", 0.16); // torso bottom shadow
  rectInto(overlay, 11, 13, 5, 6, "#ffffff", 0.12); // head highlight

  // ---- Auto outline around the silhouette ----
  const outline: Cell[] = [];
  const seen = new Set<string>();
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  occ.forEach((key) => {
    const [x, y] = key.split(",").map(Number);
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      const nk = `${nx},${ny}`;
      if (!inGrid(nx, ny) || occ.has(nk) || seen.has(nk)) continue;
      seen.add(nk);
      outline.push({ x: nx, y: ny, c: OUTLINE });
    }
  });

  const ordered = [...bgCells, ...outline, ...sil, ...face, ...glass, ...overlay];
  const px = 1.03;

  return (
    <svg
      viewBox={`0 0 ${GRID} ${GRID}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Your pixel avatar"
    >
      {ordered.map((c, i) => (
        <rect
          key={i}
          x={c.x}
          y={c.y}
          width={px}
          height={px}
          fill={c.c}
          fillOpacity={c.o ?? 1}
        />
      ))}
    </svg>
  );
}
