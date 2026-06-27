import { ST } from '@/constants/theme';
import type { ReviewLanguage, ReviewMode } from '@/lib/database.types';

export type LanguageOption = {
  value: ReviewLanguage;
  label: string;
};

export type ReviewModeOption = {
  value: ReviewMode;
  /** Short monospace tag shown on the mode card (matches the home screen). */
  mono: string;
  label: string;
  description: string;
  accent: string;
};

/**
 * Selectable languages for a new review. The `value`s match the
 * code_reviews.language CHECK constraint in the Supabase migration.
 */
export const REVIEW_LANGUAGES: readonly LanguageOption[] = [
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'typescript', label: 'TypeScript' },
];

/**
 * Selectable review modes. The `value`s match the code_reviews.review_mode
 * CHECK constraint; labels and accents mirror the home screen cards.
 */
export const REVIEW_MODES: readonly ReviewModeOption[] = [
  {
    value: 'find_bugs',
    mono: 'debug',
    label: 'Find Bugs',
    description: 'Spot logic errors and edge cases',
    accent: ST.red,
  },
  {
    value: 'generate_tests',
    mono: 'tests',
    label: 'Generate Tests',
    description: 'Build test cases for your code',
    accent: ST.cyan,
  },
  {
    value: 'explain_code',
    mono: 'explain',
    label: 'Explain Code',
    description: 'Understand what your code does',
    accent: ST.purpleLight,
  },
  {
    value: 'check_complexity',
    mono: 'big-o',
    label: 'Check Complexity',
    description: 'Analyze time and space cost',
    accent: ST.green,
  },
  {
    value: 'security_review',
    mono: 'sec',
    label: 'Security Review',
    description: 'Check for vulnerabilities',
    accent: ST.amber,
  },
  {
    value: 'hint_mode',
    mono: 'hint',
    label: 'Hint Mode',
    description: 'Get nudges, not the full answer',
    accent: ST.purpleLight,
  },
];

const REVIEW_MODE_VALUES = new Set<string>(REVIEW_MODES.map((mode) => mode.value));

/** Narrows an untyped route param to a known ReviewMode before it's trusted. */
export function isReviewMode(value: string | undefined): value is ReviewMode {
  return value != null && REVIEW_MODE_VALUES.has(value);
}

/**
 * Upper bound on pasted code length (~12k characters ≈ several hundred lines).
 * Re-exported from @stacktutor/shared so the client form and the future
 * generate-review validator enforce the identical ceiling — the server still
 * re-checks it independently because client limits are not security.
 */
export { MAX_CODE_LENGTH } from '@stacktutor/shared';
