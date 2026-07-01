"use client";

import { useId } from "react";
import {
  AVATAR_MAP,
  DEFAULT_EQUIPPED,
  type AvatarCategory,
} from "@/lib/avatar";

const STARS: [number, number, number][] = [
  [28, 30, 2],
  [160, 40, 1.6],
  [52, 150, 1.8],
  [172, 120, 1.4],
  [100, 22, 1.6],
  [138, 162, 2],
  [40, 90, 1.3],
];

export function Avatar({
  equipped,
  size = 120,
}: {
  equipped: Record<AvatarCategory, string>;
  size?: number;
}) {
  const raw = useId();
  const uid = raw.replace(/[^a-zA-Z0-9]/g, "");
  const get = (cat: AvatarCategory) =>
    AVATAR_MAP[equipped[cat]] ?? AVATAR_MAP[DEFAULT_EQUIPPED[cat]];

  const bg = get("background");
  const skin = get("skin").color!;
  const hairColor = get("hairColor").color!;
  const hairStyle = get("hairStyle").style!;
  const top = get("top");
  const bottom = get("bottom").color!;
  const glasses = get("glasses").style!;
  const wings = get("wings").style!;

  const topFill = top.color2 ? `url(#${uid}-top)` : top.color;

  const wingShapes = (style: string) => {
    switch (style) {
      case "angel":
        return (
          <>
            <ellipse cx="70" cy="132" rx="30" ry="15" fill="#eef2ff" transform="rotate(-22 70 132)" />
            <ellipse cx="76" cy="128" rx="18" ry="9" fill="#d7def6" transform="rotate(-22 76 128)" />
          </>
        );
      case "bat":
        return (
          <path
            d="M100 116 L52 114 L66 128 L46 132 L70 144 L58 152 L100 150 Z"
            fill="#2c2540"
          />
        );
      case "butterfly":
        return (
          <>
            <ellipse cx="68" cy="124" rx="23" ry="18" fill="#ff77b7" />
            <ellipse cx="75" cy="156" rx="16" ry="12" fill="#8a6bff" />
          </>
        );
      case "flame":
        return (
          <>
            <path d="M100 118 C58 108 38 132 58 152 C74 162 96 150 100 144 Z" fill="#ff8a3d" />
            <path d="M100 128 C72 120 60 138 74 152 C86 158 98 148 100 142 Z" fill="#ffcf5c" />
          </>
        );
      default:
        return null;
    }
  };

  const hairBack = () => {
    if (hairStyle === "afro")
      return <circle cx="100" cy="72" r="46" fill={hairColor} />;
    if (hairStyle === "long")
      return (
        <>
          <path d="M68 80 Q60 130 80 140 L88 120 Q76 100 78 80 Z" fill={hairColor} />
          <path d="M132 80 Q140 130 120 140 L112 120 Q124 100 122 80 Z" fill={hairColor} />
        </>
      );
    return null;
  };

  const cap = <path d="M67 82 Q66 46 100 46 Q134 46 133 82 Q120 62 100 60 Q80 62 67 82 Z" fill={hairColor} />;

  const hairFront = () => {
    switch (hairStyle) {
      case "short":
      case "long":
        return cap;
      case "bun":
        return (
          <>
            {cap}
            <circle cx="100" cy="42" r="13" fill={hairColor} />
          </>
        );
      case "spiky":
        return (
          <path
            d="M66 80 L76 48 L86 72 L100 44 L114 72 L124 48 L134 80 Z"
            fill={hairColor}
          />
        );
      case "mohawk":
        return (
          <path d="M90 80 L95 50 L100 40 L105 50 L110 80 Z" fill={hairColor} />
        );
      default:
        return null;
    }
  };

  const glassesShapes = () => {
    switch (glasses) {
      case "round":
        return (
          <g stroke="#20263a" strokeWidth="2.5" fill="none">
            <circle cx="88" cy="84" r="9" />
            <circle cx="112" cy="84" r="9" />
            <path d="M97 84 H103" />
            <path d="M79 82 L70 79" />
            <path d="M121 82 L130 79" />
          </g>
        );
      case "square":
        return (
          <g stroke="#20263a" strokeWidth="2.5" fill="none">
            <rect x="79" y="76" width="18" height="16" rx="4" />
            <rect x="103" y="76" width="18" height="16" rx="4" />
            <path d="M97 84 H103" />
          </g>
        );
      case "sun":
        return (
          <g>
            <rect x="78" y="77" width="19" height="14" rx="4" fill="#20263a" />
            <rect x="103" y="77" width="19" height="14" rx="4" fill="#20263a" />
            <path d="M97 82 H103" stroke="#20263a" strokeWidth="3" />
          </g>
        );
      case "star":
        return (
          <g>
            <circle cx="88" cy="84" r="9" fill="#ff9dcb" fillOpacity="0.55" stroke="#ff5aa0" strokeWidth="2.5" />
            <circle cx="112" cy="84" r="9" fill="#ff9dcb" fillOpacity="0.55" stroke="#ff5aa0" strokeWidth="2.5" />
            <path d="M97 84 H103" stroke="#ff5aa0" strokeWidth="2.5" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label="Your avatar"
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bg.color} />
          <stop offset="1" stopColor={bg.color2 ?? bg.color} />
        </linearGradient>
        {top.color2 && (
          <linearGradient id={`${uid}-top`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={top.color} />
            <stop offset="1" stopColor={top.color2} />
          </linearGradient>
        )}
      </defs>

      <rect x="0" y="0" width="200" height="200" fill={`url(#${uid}-bg)`} />
      {bg.style === "stars" &&
        STARS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity="0.85" />
        ))}

      {/* wings behind the body */}
      {wings !== "none" && (
        <>
          {wingShapes(wings)}
          <g transform="translate(200,0) scale(-1,1)">{wingShapes(wings)}</g>
        </>
      )}

      {/* body */}
      <rect x="72" y="150" width="56" height="44" rx="16" fill={bottom} />
      <rect x="66" y="112" width="68" height="52" rx="20" fill={topFill} />

      {/* hair behind head */}
      {hairBack()}

      {/* head */}
      <circle cx="100" cy="82" r="34" fill={skin} />

      {/* face */}
      <circle cx="78" cy="94" r="4" fill="#ff9db0" opacity="0.5" />
      <circle cx="122" cy="94" r="4" fill="#ff9db0" opacity="0.5" />
      <circle cx="88" cy="84" r="4.5" fill="#20263a" />
      <circle cx="112" cy="84" r="4.5" fill="#20263a" />
      <path
        d="M86 96 Q100 108 114 96"
        stroke="#20263a"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* hair in front + glasses */}
      {hairFront()}
      {glassesShapes()}
    </svg>
  );
}
