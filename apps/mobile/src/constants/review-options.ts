import { ST } from '@/constants/theme';
import type { ReviewLanguage, ReviewMode } from '@/lib/database.types';
import {
  REVIEW_LANGUAGES as SHARED_LANGUAGE_VALUES,
  REVIEW_MODES as SHARED_MODE_VALUES,
} from '@stacktutor/shared';

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
 * Display label for each supported language. Keyed by the shared
 * `ReviewLanguage` union, so adding a language to @stacktutor/shared forces a
 * matching label here at compile time.
 */
const LANGUAGE_LABELS: Record<ReviewLanguage, string> = {
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  typescript: 'TypeScript',
};

/**
 * Card metadata for each review mode (mono tag, label, description, accent),
 * keyed by the shared `ReviewMode` union, so adding a mode to @stacktutor/shared
 * forces matching card metadata here at compile time.
 */
const REVIEW_MODE_META: Record<ReviewMode, Omit<ReviewModeOption, 'value'>> = {
  find_bugs: {
    mono: 'debug',
    label: 'Find Bugs',
    description: 'Spot logic errors and edge cases',
    accent: ST.red,
  },
  generate_tests: {
    mono: 'tests',
    label: 'Generate Tests',
    description: 'Build test cases for your code',
    accent: ST.cyan,
  },
  explain_code: {
    mono: 'explain',
    label: 'Explain Code',
    description: 'Understand what your code does',
    accent: ST.purpleLight,
  },
  check_complexity: {
    mono: 'big-o',
    label: 'Check Complexity',
    description: 'Analyze time and space cost',
    accent: ST.green,
  },
  security_review: {
    mono: 'sec',
    label: 'Security Review',
    description: 'Check for vulnerabilities',
    accent: ST.amber,
  },
  hint_mode: {
    mono: 'hint',
    label: 'Hint Mode',
    description: 'Get nudges, not the full answer',
    accent: ST.purpleLight,
  },
};

/**
 * Selectable languages for a new review, derived from the shared
 * `REVIEW_LANGUAGES` tuple (the source of truth) paired with `LANGUAGE_LABELS`.
 * Order follows the shared tuple.
 */
export const REVIEW_LANGUAGES: readonly LanguageOption[] = SHARED_LANGUAGE_VALUES.map(
  (value) => ({ value, label: LANGUAGE_LABELS[value] }),
);

/**
 * Selectable review modes, derived from the shared `REVIEW_MODES` tuple (the
 * source of truth) paired with `REVIEW_MODE_META`. Order follows the shared
 * tuple; labels and accents mirror the home screen cards.
 */
export const REVIEW_MODES: readonly ReviewModeOption[] = SHARED_MODE_VALUES.map(
  (value) => ({ value, ...REVIEW_MODE_META[value] }),
);

const REVIEW_MODE_VALUES = new Set<string>(REVIEW_MODES.map((mode) => mode.value));

/** Narrows an untyped route param to a known ReviewMode before it's trusted. */
export function isReviewMode(value: string | undefined): value is ReviewMode {
  return value != null && REVIEW_MODE_VALUES.has(value);
}

/**
 * Upper bound on pasted code length (~12k characters ≈ several hundred lines).
 * Re-exported from @stacktutor/shared, the single source of truth, so the client
 * form and the future generate-review validator share one ceiling. The server
 * still validates length server-side — client-side checks are not a security
 * boundary.
 */
export { MAX_CODE_LENGTH } from '@stacktutor/shared';
