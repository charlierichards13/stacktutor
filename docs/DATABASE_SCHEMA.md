# StackTutor Database Schema

## Overview

StackTutor uses Supabase Postgres for user profiles, saved code reviews, and review feedback.

## Tables

### profiles

Stores app-level user profile data connected to Supabase Auth users.

### code_reviews

Stores each submitted code review, including:

- programming language
- review mode
- original code input
- structured AI response JSON
- summary
- creation timestamp

### review_feedback

Stores optional user feedback on review quality.

## Security

All public tables use Row Level Security.

Users may only read, insert, update, or delete records that belong to their authenticated user ID.

## V1 Supported Languages

- Java
- Python
- C++
- TypeScript

## V1 Review Modes

- Find Bugs
- Explain Code
- Generate Tests
- Check Complexity
- Security Review
- Hint Mode