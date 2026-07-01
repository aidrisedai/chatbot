export type ChallengeType =
  | "multiple_choice"
  | "predict_output"
  | "fill_blank"
  | "find_error";

export interface Challenge {
  type: ChallengeType;
  language: string;
  title: string;
  prompt: string;
  code: string;
  options: string[];
  answer: string;
  explanation: string;
  concept: string;
}

export const CHALLENGE_TYPES: ChallengeType[] = [
  "multiple_choice",
  "predict_output",
  "fill_blank",
  "find_error",
];

export function isChallenge(value: unknown): value is Challenge {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.type === "string" &&
    (CHALLENGE_TYPES as string[]).includes(c.type) &&
    typeof c.language === "string" &&
    typeof c.title === "string" &&
    typeof c.prompt === "string" &&
    typeof c.code === "string" &&
    Array.isArray(c.options) &&
    c.options.every((o) => typeof o === "string") &&
    typeof c.answer === "string" &&
    typeof c.explanation === "string" &&
    typeof c.concept === "string"
  );
}
