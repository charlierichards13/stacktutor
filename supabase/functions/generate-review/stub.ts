/**
 * Deterministic stubbed review for the `generate-review` scaffold (issue #16).
 *
 * AI generation is intentionally NOT connected in this issue. This returns a
 * fixed, provider-neutral {@link GeneratedReview} that satisfies the full
 * response contract (every section present, docs §5) while making clear that no
 * analysis was performed. It contains no provider-specific fields, fabricates no
 * findings about the submitted code, and never echoes the submitted code. It is
 * the single seam the OpenAI adapter replaces in the next issue.
 */

import type { GeneratedReview } from '@stacktutor/shared';

const NOT_CONNECTED_NOTICE =
  'AI review generation is not connected yet. This is a placeholder response from the ' +
  'generate-review function scaffold; no analysis of your code was performed.';

/**
 * Returns the deterministic placeholder review. The value is identical on every
 * call (the only per-request value, the request id, lives on the envelope, not
 * here), so the response is stable and easy to assert against in tests.
 */
export function buildStubReview(): GeneratedReview {
  return {
    summary: NOT_CONNECTED_NOTICE,
    findings: [],
    guidedHints: [],
    explanation: NOT_CONNECTED_NOTICE,
    suggestedTests: [],
    complexity: {
      time: 'unknown',
      space: 'unknown',
      explanation: 'Complexity analysis will be available once AI review generation is connected.',
    },
    security: {
      summary: 'Security review will be available once AI review generation is connected.',
      findings: [],
    },
  };
}
