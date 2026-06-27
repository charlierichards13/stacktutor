/**
 * @stacktutor/shared — provider-neutral review API contracts and validation.
 *
 * The single, framework-free source of truth for the request/response/error
 * shapes that the future `generate-review` Supabase Edge Function and its
 * clients build against (docs/AI_REVIEW_BACKEND.md). This package contains only
 * types, constants, and pure functions — no provider, network, or HTTP code.
 */

export * from './constants.ts';
export * from './contract.ts';
export * from './errors.ts';
export * from './validation.ts';
