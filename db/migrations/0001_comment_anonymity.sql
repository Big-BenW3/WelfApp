create extension if not exists pgcrypto;

-- 0001: per-comment anonymity for safe student replies.
-- Students stay logged in (spam / double-vote protection) but can hide
-- their name from other students. author_id is retained internally so
-- welfare admins can moderate abuse; public reads return author = null.
alter table comments add column if not exists is_anonymous boolean not null default false;