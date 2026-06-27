/**
 * Provider-neutral request/response shapes for the `generate-review` API.
 *
 * These types are the frozen contract from docs/AI_REVIEW_BACKEND.md §4–§5. The
 * same `GeneratedReview` shape is returned regardless of which AI provider
 * produced it; a provider adapter is responsible for mapping its output onto
 * these types. No provider-specific fields appear here.
 */

import type { ReviewLanguage, ReviewMode } from './constants.ts';

/** Severity of a single review finding. */
export type ReviewSeverity = 'info' | 'warning' | 'error';

/**
 * One concrete observation about the submitted code. `hint` and the line range
 * are nullable so a finding can omit them without changing the shape.
 */
export type ReviewFinding = {
  title: string;
  severity: ReviewSeverity;
  explanation: string;
  hint: string | null;
  lineStart: number | null;
  lineEnd: number | null;
};

/** A suggested test case the student could add for their code. */
export type SuggestedTestCase = {
  name: string;
  input: string;
  expectedBehavior: string;
  reason: string;
};

/** Time/space complexity analysis with a short justification. */
export type ComplexityAnalysis = {
  time: string;
  space: string;
  explanation: string;
};

/** Security-focused summary plus any security findings. */
export type SecurityFeedback = {
  summary: string;
  findings: ReviewFinding[];
};

/**
 * The structured review. Every top-level section always exists; the selected
 * mode changes emphasis and depth, not the shape (docs §5). Collections use an
 * empty array when a section is not the focus of the chosen mode.
 */
export type GeneratedReview = {
  summary: string;
  findings: ReviewFinding[];
  guidedHints: string[];
  explanation: string;
  suggestedTests: SuggestedTestCase[];
  complexity: ComplexityAnalysis;
  security: SecurityFeedback;
};

/** The minimal, well-typed request body accepted by the endpoint (docs §4). */
export type GenerateReviewRequest = {
  language: ReviewLanguage;
  reviewMode: ReviewMode;
  code: string;
};

/** A successful response: a correlation id plus the structured review. */
export type GenerateReviewResponse = {
  requestId: string;
  review: GeneratedReview;
};
