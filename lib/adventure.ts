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
}

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
      { name: "Bugling", emoji: "🐛", hp: 55, dmg: 14 },
      { name: "Sporeling", emoji: "🍄", hp: 65, dmg: 16 },
      { name: "Syntaxaur", emoji: "🦖", hp: 120, dmg: 18, boss: true },
    ],
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
      { name: "Glitchling", emoji: "👾", hp: 70, dmg: 17 },
      { name: "Creeper", emoji: "🕷️", hp: 80, dmg: 19 },
      { name: "Loopernaut", emoji: "🌀", hp: 150, dmg: 21, boss: true },
    ],
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
      { name: "Wisp", emoji: "👻", hp: 85, dmg: 19 },
      { name: "Gremlin", emoji: "👺", hp: 90, dmg: 21 },
      { name: "Recursor", emoji: "🐲", hp: 170, dmg: 23, boss: true },
    ],
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
      { name: "Slime", emoji: "🦠", hp: 95, dmg: 20 },
      { name: "Deep Spawn", emoji: "🐙", hp: 100, dmg: 22 },
      { name: "Listlord", emoji: "🦑", hp: 190, dmg: 24, boss: true },
    ],
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
      { name: "Sentinel", emoji: "🤖", hp: 105, dmg: 22 },
      { name: "Wraith", emoji: "🧟", hp: 110, dmg: 24 },
      { name: "Null Dragon", emoji: "🐉", hp: 230, dmg: 26, boss: true },
    ],
  },
];

export function isWorldUnlocked(index: number, cleared: string[]): boolean {
  return index === 0 || cleared.includes(WORLDS[index - 1].id);
}
