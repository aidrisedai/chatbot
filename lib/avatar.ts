export type AvatarCategory =
  | "background"
  | "skin"
  | "hairStyle"
  | "hairColor"
  | "top"
  | "bottom"
  | "glasses"
  | "wings";

export const AVATAR_CATEGORIES: { key: AvatarCategory; label: string }[] = [
  { key: "background", label: "Background" },
  { key: "skin", label: "Skin" },
  { key: "hairStyle", label: "Hair" },
  { key: "hairColor", label: "Hair color" },
  { key: "top", label: "Top" },
  { key: "bottom", label: "Bottom" },
  { key: "glasses", label: "Glasses" },
  { key: "wings", label: "Wings" },
];

export interface AvatarItem {
  id: string;
  category: AvatarCategory;
  name: string;
  cost: number; // 0 = owned by default
  color?: string;
  color2?: string;
  style?: string;
}

export const AVATAR_ITEMS: AvatarItem[] = [
  // Backgrounds
  { id: "bg-night", category: "background", name: "Night", cost: 0, color: "#0d1122", color2: "#1b2350" },
  { id: "bg-sky", category: "background", name: "Sky", cost: 15, color: "#7ec8ff", color2: "#d4ecff" },
  { id: "bg-mint", category: "background", name: "Mint", cost: 20, color: "#3fcfa0", color2: "#bff3e0" },
  { id: "bg-sunset", category: "background", name: "Sunset", cost: 25, color: "#ff9a63", color2: "#ffd59e" },
  { id: "bg-grape", category: "background", name: "Grape", cost: 30, color: "#7c5cff", color2: "#c3b3ff" },
  { id: "bg-space", category: "background", name: "Space", cost: 60, color: "#0a0e24", color2: "#241b52", style: "stars" },

  // Skin (all free — identity shouldn't cost)
  { id: "skin-1", category: "skin", name: "Porcelain", cost: 0, color: "#ffd9bd" },
  { id: "skin-2", category: "skin", name: "Light", cost: 0, color: "#f0b48a" },
  { id: "skin-3", category: "skin", name: "Tan", cost: 0, color: "#c67e52" },
  { id: "skin-4", category: "skin", name: "Deep", cost: 0, color: "#8a5233" },
  { id: "skin-5", category: "skin", name: "Rich", cost: 0, color: "#5c3620" },

  // Hair colors
  { id: "hc-black", category: "hairColor", name: "Black", cost: 0, color: "#221f2b" },
  { id: "hc-brown", category: "hairColor", name: "Brown", cost: 0, color: "#5a3a22" },
  { id: "hc-blonde", category: "hairColor", name: "Blonde", cost: 0, color: "#e8c66a" },
  { id: "hc-red", category: "hairColor", name: "Red", cost: 10, color: "#c1452e" },
  { id: "hc-blue", category: "hairColor", name: "Blue", cost: 15, color: "#4d8bff" },
  { id: "hc-pink", category: "hairColor", name: "Pink", cost: 15, color: "#ff77b7" },
  { id: "hc-green", category: "hairColor", name: "Green", cost: 15, color: "#43d17a" },
  { id: "hc-silver", category: "hairColor", name: "Silver", cost: 20, color: "#dfe4f5" },

  // Hair styles
  { id: "hair-none", category: "hairStyle", name: "Bald", cost: 0, style: "none" },
  { id: "hair-short", category: "hairStyle", name: "Short", cost: 0, style: "short" },
  { id: "hair-long", category: "hairStyle", name: "Long", cost: 15, style: "long" },
  { id: "hair-bun", category: "hairStyle", name: "Bun", cost: 15, style: "bun" },
  { id: "hair-spiky", category: "hairStyle", name: "Spiky", cost: 20, style: "spiky" },
  { id: "hair-afro", category: "hairStyle", name: "Afro", cost: 20, style: "afro" },
  { id: "hair-mohawk", category: "hairStyle", name: "Mohawk", cost: 30, style: "mohawk" },

  // Tops
  { id: "top-teal", category: "top", name: "Teal tee", cost: 0, color: "#43c9c0" },
  { id: "top-gray", category: "top", name: "Gray tee", cost: 0, color: "#8a93b0" },
  { id: "top-red", category: "top", name: "Red tee", cost: 10, color: "#e0574e" },
  { id: "top-purple", category: "top", name: "Purple tee", cost: 10, color: "#8a6bff" },
  { id: "top-gold", category: "top", name: "Gold jacket", cost: 25, color: "#f2c14e" },
  { id: "top-rainbow", category: "top", name: "Rainbow", cost: 40, color: "#ff6b6b", color2: "#6ea8fe" },

  // Bottoms
  { id: "bot-navy", category: "bottom", name: "Navy", cost: 0, color: "#2b355c" },
  { id: "bot-black", category: "bottom", name: "Black", cost: 0, color: "#22262f" },
  { id: "bot-jeans", category: "bottom", name: "Blue jeans", cost: 10, color: "#3f6dbf" },
  { id: "bot-purple", category: "bottom", name: "Purple", cost: 15, color: "#6a4fb0" },
  { id: "bot-gold", category: "bottom", name: "Gold", cost: 25, color: "#caa23a" },

  // Glasses
  { id: "gl-none", category: "glasses", name: "None", cost: 0, style: "none" },
  { id: "gl-round", category: "glasses", name: "Round", cost: 15, style: "round" },
  { id: "gl-square", category: "glasses", name: "Square", cost: 15, style: "square" },
  { id: "gl-sun", category: "glasses", name: "Shades", cost: 20, style: "sun" },
  { id: "gl-star", category: "glasses", name: "Star specs", cost: 35, style: "star" },

  // Wings
  { id: "wing-none", category: "wings", name: "None", cost: 0, style: "none" },
  { id: "wing-angel", category: "wings", name: "Angel", cost: 50, style: "angel" },
  { id: "wing-bat", category: "wings", name: "Bat", cost: 50, style: "bat" },
  { id: "wing-butterfly", category: "wings", name: "Butterfly", cost: 60, style: "butterfly" },
  { id: "wing-flame", category: "wings", name: "Flame", cost: 80, style: "flame" },
];

export const AVATAR_MAP: Record<string, AvatarItem> = Object.fromEntries(
  AVATAR_ITEMS.map((i) => [i.id, i])
);

export const DEFAULT_EQUIPPED: Record<AvatarCategory, string> = {
  background: "bg-night",
  skin: "skin-2",
  hairStyle: "hair-short",
  hairColor: "hc-brown",
  top: "top-teal",
  bottom: "bot-navy",
  glasses: "gl-none",
  wings: "wing-none",
};

export type AvatarConfig = {
  equipped: Record<AvatarCategory, string>;
  owned: string[];
};

export function defaultAvatar(): AvatarConfig {
  return {
    equipped: { ...DEFAULT_EQUIPPED },
    owned: AVATAR_ITEMS.filter((i) => i.cost === 0).map((i) => i.id),
  };
}
