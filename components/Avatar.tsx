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

  // ---- Wings (behind body, mirrored) — each a distinct pixel-map shape ----
  // Column 0 = outer tip, column 9 = attaches behind the shoulder.
  type WingMap = { oy: number; legend: Record<string, string>; rows: string[] };
  const WINGS: Record<string, WingMap> = {
    angel: {
      oy: 6,
      legend: { W: "#eef2ff", a: "#ccd6ef" },
      rows: [
        "......WWW.",
        "....WWWWW.",
        "..WWWWWWW.",
        ".WWWWWWaW.",
        "WWWWWWWWW.",
        "WWWWWWWWW.",
        "aWWWWWWWW.",
        ".aWWWaWWW.",
        "..aW.aWWW.",
        "...W..aWW.",
        "......W.W.",
      ],
    },
    bat: {
      oy: 7,
      legend: { B: "#2c2540", b: "#443a63" },
      rows: [
        ".......BB.",
        ".....BBBB.",
        "...BBBBBB.",
        ".BBBBBbBB.",
        "BBBBBBBBB.",
        "bBBBBBBBB.",
        ".bBBBBBBB.",
        "B.bBBbBBB.",
        ".B.Bb.bBB.",
        "..B.B..bB.",
      ],
    },
    butterfly: {
      oy: 6,
      legend: { p: "#ff77b7", q: "#8a6bff", s: "#ffffff" },
      rows: [
        "..pppp....",
        ".ppppppp..",
        "pppppsppp.",
        "ppppppppp.",
        "psppppppp.",
        ".ppppppp..",
        "...ppp....",
        "....qqq...",
        "..qqqqqq..",
        "..qqsqqq..",
        "...qqqq...",
        "....qq....",
      ],
    },
    flame: {
      oy: 8,
      legend: { f: "#ff8a3d", F: "#ffcf5c", r: "#ff5a2c" },
      rows: [
        "...f...f..",
        "..fff.fff.",
        ".ff.fffFf.",
        "rff.ffFFf.",
        "rffffFFFf.",
        "rfffffFFf.",
        ".rfffFFf..",
        "..rfffF...",
        "...rff....",
      ],
    },
  };
  const wm = WINGS[wings];
  if (wm) {
    wm.rows.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) {
        const col = wm.legend[row[c]];
        if (!col) continue;
        addSil(c, wm.oy + r, col);
        addSil(31 - c, wm.oy + r, col);
      }
    });
  }

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

  // ---- Head (rounded), ears, neck ----
  rectSil(14, 17, 16, 17, skin); // neck
  (
    [
      [4, 12, 19],
      [5, 11, 20],
      [6, 10, 21],
      [7, 10, 21],
      [8, 10, 21],
      [9, 10, 21],
      [10, 10, 21],
      [11, 10, 21],
      [12, 10, 21],
      [13, 10, 21],
      [14, 11, 20],
      [15, 12, 19],
    ] as const
  ).forEach(([y, x0, x1]) => rectSil(x0, x1, y, y, skin));
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

  // ---- Pet (detailed sprite at the lower-left, in front of the wings) ----
  const pet = get("pets").style!;
  if (pet && pet !== "none") {
    const P = (x: number, y: number, c: string) => addSil(x, y, c);
    const F = (x: number, y: number, c: string) => face.push({ x, y, c });
    const many = (cells: number[][], c: string) =>
      cells.forEach(([x, y]) => P(x, y, c));

    if (pet === "cat") {
      const g = "#8a93b0";
      many([[3, 23], [3, 24], [5, 23], [5, 24]], g); // ears
      P(3, 24, "#ff9db0");
      P(5, 24, "#ff9db0"); // inner ears
      many([[3, 25], [4, 25], [5, 25], [3, 26], [4, 26], [5, 26], [3, 27], [4, 27], [5, 27]], g); // head
      many([[2, 28], [3, 28], [4, 28], [5, 28], [6, 28], [2, 29], [3, 29], [4, 29], [5, 29], [6, 29], [2, 30], [3, 30], [4, 30], [5, 30], [6, 30]], g); // body
      many([[4, 29], [4, 30]], "#cfd6ea"); // belly
      many([[7, 27], [7, 28], [8, 28]], g); // tail
      many([[2, 31], [3, 31], [5, 31], [6, 31]], g); // feet
      F(3, 26, DARK);
      F(5, 26, DARK);
      F(4, 27, "#ff9db0"); // nose
    } else if (pet === "dog") {
      const b = "#b07a4a";
      many([[2, 25], [2, 26], [6, 25], [6, 26]], "#8a5a34"); // floppy ears
      many([[3, 25], [4, 25], [5, 25], [3, 26], [4, 26], [5, 26], [3, 27], [4, 27], [5, 27]], b); // head
      many([[4, 27], [4, 28]], "#e6cba3"); // snout
      many([[2, 28], [3, 28], [4, 28], [5, 28], [6, 28], [2, 29], [3, 29], [4, 29], [5, 29], [6, 29], [2, 30], [3, 30], [4, 30], [5, 30], [6, 30]], b); // body
      many([[7, 28], [7, 29]], b); // tail
      many([[2, 31], [3, 31], [5, 31], [6, 31]], b); // feet
      F(3, 26, DARK);
      F(5, 26, DARK);
      F(4, 27, DARK); // nose
    } else if (pet === "bunny") {
      const wt = "#eef2ff";
      many([[3, 22], [3, 23], [3, 24], [5, 22], [5, 23], [5, 24]], wt); // tall ears
      P(3, 23, "#ffb3cf");
      P(5, 23, "#ffb3cf"); // inner ears
      many([[3, 25], [4, 25], [5, 25], [3, 26], [4, 26], [5, 26], [3, 27], [4, 27], [5, 27]], wt); // head
      many([[2, 28], [3, 28], [4, 28], [5, 28], [6, 28], [2, 29], [3, 29], [4, 29], [5, 29], [6, 29], [3, 30], [4, 30], [5, 30]], wt); // body
      P(7, 29, wt); // tail puff
      many([[2, 31], [3, 31], [5, 31], [6, 31]], wt); // feet
      F(3, 26, DARK);
      F(5, 26, DARK);
      F(4, 27, "#ff9db0"); // nose
    } else if (pet === "fox") {
      const o = "#e0844e";
      const wt = "#f4efe6";
      many([[3, 23], [3, 24], [5, 23], [5, 24]], o); // ears
      P(3, 23, "#2b2540");
      P(5, 23, "#2b2540"); // dark ear tips
      many([[3, 25], [4, 25], [5, 25], [3, 26], [4, 26], [5, 26], [3, 27], [4, 27], [5, 27]], o); // head
      P(3, 27, wt);
      P(5, 27, wt); // white cheeks
      many([[2, 28], [3, 28], [4, 28], [5, 28], [6, 28], [2, 29], [3, 29], [4, 29], [5, 29], [6, 29], [3, 30], [4, 30], [5, 30]], o); // body
      many([[4, 28], [4, 29]], wt); // white chest
      many([[7, 27], [7, 28], [8, 28], [8, 29]], o); // bushy tail
      P(8, 28, wt); // white tail tip
      many([[2, 31], [3, 31], [5, 31], [6, 31]], "#2b2540"); // dark socks
      F(3, 26, DARK);
      F(5, 26, DARK);
      F(4, 27, "#2b2540"); // nose
    } else if (pet === "robot") {
      const s = "#b9c2e0";
      const m = "#7f8bb0";
      P(4, 22, "#ff6b6b"); // antenna light
      P(4, 23, s); // antenna
      many([[3, 24], [4, 24], [5, 24], [3, 25], [4, 25], [5, 25], [3, 26], [4, 26], [5, 26]], s); // head
      many([[3, 27], [4, 27], [5, 27], [3, 28], [4, 28], [5, 28], [3, 29], [4, 29], [5, 29]], s); // body
      P(4, 28, m); // chest panel
      many([[2, 27], [2, 28], [6, 27], [6, 28]], m); // arms
      many([[3, 30], [3, 31], [5, 30], [5, 31]], m); // legs
      F(3, 25, "#57e0c8");
      F(5, 25, "#57e0c8"); // glowing eyes
      F(4, 26, DARK); // mouth
    } else if (pet === "dragon") {
      const g = "#43d17a";
      const dg = "#2f9d5b";
      P(3, 23, "#e8e0c0");
      P(5, 23, "#e8e0c0"); // horns
      many([[3, 24], [4, 24], [5, 24], [3, 25], [4, 25], [5, 25], [3, 26], [4, 26], [5, 26]], g); // head
      many([[2, 27], [3, 27], [4, 27], [5, 27], [6, 27], [2, 28], [3, 28], [4, 28], [5, 28], [6, 28], [3, 29], [4, 29], [5, 29]], g); // body
      many([[4, 28], [4, 29]], "#ffcf5c"); // belly
      many([[6, 24], [6, 25], [7, 25]], dg); // little wing
      many([[7, 28], [8, 28], [8, 29]], g); // tail
      P(8, 29, dg); // spike
      many([[2, 30], [3, 30], [5, 30], [6, 30], [2, 31], [6, 31]], g); // feet
      F(3, 25, DARK);
      F(5, 25, DARK);
      F(4, 26, dg); // nostril
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
