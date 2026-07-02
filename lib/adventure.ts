export interface Encounter {
  name: string;
  emoji: string;
  hp: number;
  dmg: number;
  boss?: boolean;
}

export interface WorldDef {
  id: string;
  name: string;
  emoji: string;
  color: string;
  topic: string; // fed to the challenge generator as the "track"
  level: number; // difficulty
  quest: string;
  encounters: Encounter[]; // last one is the boss
  reward: string; // avatar item id unlocked when the boss is first defeated
}

export interface Attack {
  id: string;
  name: string;
  emoji: string;
  dmg: number;
  cooldown: number; // turns before it can be used again
}

// Stronger spells recharge over more turns; Spark is always available.
export const ATTACKS: Attack[] = [
  { id: "spark", name: "Spark", emoji: "⚡", dmg: 24, cooldown: 0 },
  { id: "frost", name: "Frost", emoji: "❄️", dmg: 36, cooldown: 1 },
  { id: "fire", name: "Fireball", emoji: "🔥", dmg: 48, cooldown: 2 },
  { id: "bolt", name: "Thunderbolt", emoji: "🌩️", dmg: 64, cooldown: 3 },
];

export const POTION_HEAL = 40;
export const POTION_COST = 15;

export const PLAYER_MAX_HP = 100;
export const PLAYER_DMG = 28; // base damage per correct answer
export const STREAK_DMG = 7; // extra damage per battle-streak
export const HEAL_BETWEEN = 30; // HP restored after each win in a world
export const MONSTER_COINS = 8;
export const BOSS_COINS = 25;

export const WORLDS: WorldDef[] = [
  {
    id: "forest",
    name: "Syntax Forest",
    emoji: "🌲",
    color: "#2f9d5b",
    topic: "Python basics for absolute beginners: variables, print, strings, and numbers",
    level: 1,
    quest: "Clear the forest of glitchy critters and defeat the Syntaxaur.",
    encounters: [
      { name: "Bugling", emoji: "🐛", hp: 75, dmg: 16 },
      { name: "Sporeling", emoji: "🍄", hp: 90, dmg: 18 },
      { name: "Syntaxaur", emoji: "🦖", hp: 185, dmg: 22, boss: true },
    ],
    reward: "pet-cat",
  },
  {
    id: "caverns",
    name: "Loop Caverns",
    emoji: "🔁",
    color: "#4d8bff",
    topic: "Python loops for beginners: for loops, while loops, and ranges",
    level: 2,
    quest: "Break the endless loops and best the Loopernaut.",
    encounters: [
      { name: "Glitchling", emoji: "👾", hp: 100, dmg: 20 },
      { name: "Creeper", emoji: "🕷️", hp: 115, dmg: 22 },
      { name: "Loopernaut", emoji: "🌀", hp: 225, dmg: 26, boss: true },
    ],
    reward: "wing-butterfly",
  },
  {
    id: "peaks",
    name: "Function Peaks",
    emoji: "🏔️",
    color: "#8a6bff",
    topic: "Python functions for beginners: defining functions, parameters, and return values",
    level: 3,
    quest: "Scale the peaks and out-think the Recursor.",
    encounters: [
      { name: "Wisp", emoji: "👻", hp: 130, dmg: 23 },
      { name: "Gremlin", emoji: "👺", hp: 140, dmg: 25 },
      { name: "Recursor", emoji: "🐲", hp: 260, dmg: 29, boss: true },
    ],
    reward: "pet-dragon",
  },
  {
    id: "isles",
    name: "Array Isles",
    emoji: "🏝️",
    color: "#43c9c0",
    topic: "Python lists for beginners: creating lists, indexing, and simple list methods",
    level: 4,
    quest: "Sail the isles and sink the Listlord.",
    encounters: [
      { name: "Slime", emoji: "🦠", hp: 150, dmg: 26 },
      { name: "Deep Spawn", emoji: "🐙", hp: 160, dmg: 28 },
      { name: "Listlord", emoji: "🦑", hp: 300, dmg: 32, boss: true },
    ],
    reward: "wing-angel",
  },
  {
    id: "keep",
    name: "Logic Keep",
    emoji: "🏰",
    color: "#e0574e",
    topic: "Python conditionals for beginners: if/elif/else, booleans, and comparisons",
    level: 5,
    quest: "Storm the keep and slay the Null Dragon.",
    encounters: [
      { name: "Sentinel", emoji: "🤖", hp: 170, dmg: 29 },
      { name: "Wraith", emoji: "🧟", hp: 180, dmg: 31 },
      { name: "Null Dragon", emoji: "🐉", hp: 360, dmg: 35, boss: true },
    ],
    reward: "wing-flame",
  },
];

export function isWorldUnlocked(index: number, cleared: string[]): boolean {
  return index === 0 || cleared.includes(WORLDS[index - 1].id);
}
