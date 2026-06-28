# @stacktutor/shared

Provider-neutral TypeScript contracts and pure request validation for the future
authenticated `generate-review` Supabase Edge Function.

This package is the framework-free source of truth for the request, response, and
error **shapes** described in [`docs/AI_REVIEW_BACKEND.md`](../../docs/AI_REVIEW_BACKEND.md).
It contains only types, constants, and pure functions — **no** Edge Function, AI
provider, HTTP/CORS handling, prompt construction, auth, or network access.

## Contents

| Module | Exports |
| --- | --- |
| `src/contract.ts` | `GenerateReviewRequest`, `GenerateReviewResponse`, `GeneratedReview`, `ReviewFinding`, `ReviewSeverity`, `SuggestedTestCase`, `ComplexityAnalysis`, `SecurityFeedback` |
| `src/constants.ts` | `REVIEW_LANGUAGES`, `REVIEW_MODES`, `MAX_CODE_LENGTH`, `ReviewLanguage`, `ReviewMode`, `isReviewLanguage`, `isReviewMode` |
| `src/errors.ts` | `ReviewApiError`, `ReviewApiErrorCode`, `REVIEW_API_ERROR_METADATA`, `REVIEW_API_ERROR_MESSAGES` |
| `src/validation.ts` | `validateGenerateReviewRequest`, `ValidationResult` |

## Source of truth

This package is the single source of truth for the supported language values,
review-mode values, their derived types, and `MAX_CODE_LENGTH`. The mobile app
and the future backend **consume** these definitions rather than redeclaring them:

- `apps/mobile/src/lib/database.types.ts` re-exports `ReviewLanguage` / `ReviewMode`.
- `apps/mobile/src/constants/review-options.ts` derives its option lists from the
  `REVIEW_LANGUAGES` / `REVIEW_MODES` tuples and re-exports `MAX_CODE_LENGTH`.
- the future `generate-review` Edge Function validates against these values.

The server still runs its own validation against these values — client-side
validation is never a security boundary — but the values are defined once, here.
The only place they are mirrored by hand is the `code_reviews` CHECK constraints
in the Supabase migration; keep that migration in sync when the lists change.

## Consuming this package

The package ships **raw TypeScript** (no build step). Its internal imports use
explicit `.ts` extensions because that is the only form both Node's native runner
and Deno resolve (extensionless and `.js`-to-`.ts` specifiers both fail under
Node ESM and Deno).

- **Mobile (Expo / Metro).** Expo's default Metro config auto-detects the npm
  workspace (`getWatchFolders` / `getModulesPaths`), so no custom `metro.config.js`
  is needed. Metro transforms the raw `.ts` source. TypeScript consumers must set
  `allowImportingTsExtensions: true` (safe with `noEmit`) so `tsc` accepts the
  package's `.ts` imports — `apps/mobile/tsconfig.json` does this.
- **Future `generate-review` Edge Function (Deno).** Deno imports `.ts` directly,
  so the function will reference these modules from `supabase/functions/_shared`
  (e.g. an `import_map`/symlink/relative import into this package). Deno's `.ts`
  requirement is exactly why the package keeps explicit `.ts` extensions. End-to-end
  `supabase functions serve` + deploy resolution cannot be proven until the function
  exists, so it is a verification item for that follow-on issue.

## Requirements

Tests run on Node's built-in `node:test` runner using Node's native TypeScript
support, so the package needs **no test framework** — only `@types/node`
(types-only devDep) so `tsc` can type-check the test files.

Native, unflagged TypeScript execution requires **Node >= 22.18.0** (LTS backport)
or **>= 23.6.0** (where it became the default); see the `engines` field. Verified
on Node 24.

## Scripts

```bash
npm run test --workspace @stacktutor/shared       # Node's built-in test runner
npm run typecheck --workspace @stacktutor/shared  # tsc --noEmit (strict)
```

From the repo root, `npm test` and `npm run typecheck` target this package
explicitly, so it is always covered by verification and cannot be silently skipped.
