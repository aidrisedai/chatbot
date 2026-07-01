export type ChallengeType =
  | "multiple_choice"
  | "predict_output"
  | "fill_blank"
  | "find_error"
  | "write_code"
  | "mini_project";

export interface Challenge {
  type: ChallengeType;
  language: string;
  title: string;
  teachPoint: string;
  teachExample: string;
  prompt: string;
  code: string;
  options: string[];
  answer: string;
  explanation: string;
  concept: string;
  checks: string[];
  solution: string;
}

export interface GradeResult {
  pass: boolean;
  feedback: string;
}

export const CHALLENGE_TYPES: ChallengeType[] = [
  "multiple_choice",
  "predict_output",
  "fill_blank",
  "find_error",
  "write_code",
  "mini_project",
];

// Open-ended challenges: the learner writes code that the AI grades.
export const OPEN_TYPES: ChallengeType[] = ["write_code", "mini_project"];

export function isOpen(type: ChallengeType): boolean {
  return OPEN_TYPES.includes(type);
}

export function isChallenge(value: unknown): value is Challenge {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.type === "string" &&
    (CHALLENGE_TYPES as string[]).includes(c.type) &&
    typeof c.language === "string" &&
    typeof c.title === "string" &&
    typeof c.teachPoint === "string" &&
    typeof c.teachExample === "string" &&
    typeof c.prompt === "string" &&
    typeof c.code === "string" &&
    Array.isArray(c.options) &&
    c.options.every((o) => typeof o === "string") &&
    typeof c.answer === "string" &&
    typeof c.explanation === "string" &&
    typeof c.concept === "string" &&
    Array.isArray(c.checks) &&
    c.checks.every((o) => typeof o === "string") &&
    typeof c.solution === "string"
  );
}
