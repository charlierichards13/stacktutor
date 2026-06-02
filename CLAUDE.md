# StackTutor Claude Code Instructions

StackTutor is a polished AI code review trainer for CS students.

## Product Positioning

StackTutor is not a homework cheating app or a generic AI chatbot wrapper.

It is a guided debugging trainer that helps students understand code through:
- hints
- explanations
- test cases
- complexity analysis
- security review feedback
- step-by-step reasoning

## Design Standard

The UI should feel like a premium developer education product.

Avoid:
- generic AI SaaS landing page patterns
- excessive gradient blobs
- random one-off Tailwind styling
- overused marketing copy
- chatbot-like UI as the main product identity
- huge unstructured files

Prefer:
- restrained dark UI
- strong spacing and hierarchy
- realistic code review/product mockups
- reusable components
- consistent tokens
- accessible contrast
- clean TypeScript
- small, focused edits

## Engineering Rules

- Do not rewrite unrelated files.
- Do not add dependencies unless asked.
- Do not expose secrets.
- Do not touch .env files.
- Keep changes small and reviewable.
- Explain all files changed.
- Use TypeScript carefully.
- Keep the project portfolio/recruiter-ready.

## Current Stack

- Next.js landing page in apps/web
- Expo React Native mobile app in apps/mobile
- TypeScript
- Tailwind CSS on web
- Supabase planned for backend/auth
- Server-side AI API planned later