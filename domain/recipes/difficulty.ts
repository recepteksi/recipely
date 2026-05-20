export const Difficulty = {
  Easy: 'EASY',
  Medium: 'MEDIUM',
  Hard: 'HARD',
} as const;

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const DIFFICULTY_VALUES: readonly Difficulty[] = [
  Difficulty.Easy,
  Difficulty.Medium,
  Difficulty.Hard,
];
