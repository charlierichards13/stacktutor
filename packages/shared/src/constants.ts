/**
 * Provider-neutral enum values and limits for the review API contract.
 *
 * This module is the single source of truth for the supported language values,
 * review-mode values, their derived types, and the maximum code length
 * (see docs/AI_REVIEW_BACKEND.md §4). Both sides consume these definitions
 * rather than redeclaring them:
 *
 *   - apps/mobile/src/lib/database.types.ts        (re-exports ReviewLanguage / ReviewMode)
 *   - apps/mobile/src/constants/review-options.ts  (consumes the tuples + MAX_CODE_LENGTH)
 *   - the future `generate-review` Edge Function    (validates against these)
 *
 * The server still runs its own validation against these values — client-side
 * validation is never a security boundary — but the values themselves are
 * defined once, here.
 *
 * The `code_reviews` CHECK constraints in the Supabase migration are the one
 * place these values are mirrored by hand; keep that migration in sync if the
 * lists below change.
 */

/** Supported submission languages, exactly matching the request contract. */
export const REVIEW_LANGUAGES = ['python', 'java', 'cpp', 'typescript'] as const;

/** A language accepted by the review API. */
export type ReviewLanguage = (typeof REVIEW_LANGUAGES)[number];

/** Supported review modes, exactly matching the request contract. */
export const REVIEW_MODES = [
  'find_bugs',
  'generate_tests',
  'explain_code',
  'check_complexity',
  'security_review',
  'hint_mode',
] as const;

/** A review mode accepted by the review API. */
export type ReviewMode = (typeof REVIEW_MODES)[number];

/**
 * Maximum accepted `code` length, in UTF-16 code units. Mirrors the mobile
 * form's MAX_CODE_LENGTH; the server enforces it independently so an oversized
 * payload is rejected before any provider call.
 */
export const MAX_CODE_LENGTH = 12000;

/** Narrows an unknown value to a supported {@link ReviewLanguage}. */
export function isReviewLanguage(value: unknown): value is ReviewLanguage {
  return typeof value === 'string' && (REVIEW_LANGUAGES as readonly string[]).includes(value);
}

/** Narrows an unknown value to a supported {@link ReviewMode}. */
export function isReviewMode(value: unknown): value is ReviewMode {
  return typeof value === 'string' && (REVIEW_MODES as readonly string[]).includes(value);
}
