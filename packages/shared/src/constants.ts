/**
 * Provider-neutral enum values and limits for the review API contract.
 *
 * These are the server-side source of truth for the future `generate-review`
 * Edge Function (see docs/AI_REVIEW_BACKEND.md §4). They are intentionally kept
 * in lockstep with — but independent of — the mobile client constants:
 *
 *   - apps/mobile/src/lib/database.types.ts        (ReviewLanguage / ReviewMode)
 *   - apps/mobile/src/constants/review-options.ts  (REVIEW_LANGUAGES / MAX_CODE_LENGTH)
 *   - the code_reviews CHECK constraints in the initial Supabase migration
 *
 * The server re-declares these rather than importing the client constants on
 * purpose: client limits are not security, so the backend must validate against
 * its own copy. If any of the lists below change, update the consumers above so
 * the values stay identical.
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
