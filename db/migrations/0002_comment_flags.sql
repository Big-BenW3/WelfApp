create extension if not exists pgcrypto;

-- 0002: backfill comment moderation flags for databases created before
-- 0000/0001 fully ran. Both columns are safe to add idempotently; the
-- repository also COALESCE-guards reads so old DBs keep working.
alter table comments add column if not exists is_hidden boolean not null default false;
alter table comments add column if not exists is_anonymous boolean not null default false;
