-- StackTutor initial database schema
-- Supports user profiles, saved code reviews, and review feedback.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.code_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  language text not null,
  review_mode text not null,
  code_input text not null,
  ai_response jsonb not null,
  summary text,
  created_at timestamptz not null default now(),

  constraint code_reviews_language_check
    check (language in ('java', 'python', 'cpp', 'typescript')),

  constraint code_reviews_mode_check
    check (review_mode in (
      'find_bugs',
      'explain_code',
      'generate_tests',
      'check_complexity',
      'security_review',
      'hint_mode'
    ))
);

create table if not exists public.review_feedback (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.code_reviews(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  feedback_text text,
  created_at timestamptz not null default now()
);

create index if not exists code_reviews_user_created_idx
  on public.code_reviews(user_id, created_at desc);

create index if not exists review_feedback_review_idx
  on public.review_feedback(review_id);

alter table public.profiles enable row level security;
alter table public.code_reviews enable row level security;
alter table public.review_feedback enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can view their own code reviews"
on public.code_reviews
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own code reviews"
on public.code_reviews
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete their own code reviews"
on public.code_reviews
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can view their own review feedback"
on public.review_feedback
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own review feedback"
on public.review_feedback
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.code_reviews
    where code_reviews.id = review_feedback.review_id
      and code_reviews.user_id = auth.uid()
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();