create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email varchar(240) not null unique,
  password_hash text not null,
  display_name varchar(60) not null,
  role varchar(20) not null default 'student',
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists issues (
  id uuid primary key default gen_random_uuid(),
  title varchar(120) not null,
  description text not null,
  category varchar(30) not null check (category in ('Hostel', 'Academic', 'Sports', 'Health', 'SUG')),
  status varchar(30) not null default 'Under Review',
  is_anonymous boolean not null default false,
  author_id uuid references users(id) on delete set null,
  author_name_snapshot varchar(60),
  image_url text,
  official_reply text,
  official_reply_at timestamptz,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  direction varchar(5) not null check (direction in ('up', 'down')),
  is_anonymous boolean not null default true,
  created_at timestamptz not null default now(),
  unique (issue_id, user_id)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues(id) on delete cascade,
  author_id uuid references users(id) on delete set null,
  author_name_snapshot varchar(60),
  body varchar(1200) not null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid references issues(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  reporter_id uuid references users(id) on delete set null,
  reason varchar(300) not null,
  created_at timestamptz not null default now()
);

create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references users(id) on delete cascade,
  issue_id uuid references issues(id) on delete set null,
  action varchar(80) not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists issues_category_status_idx on issues(category, status);
create index if not exists issues_created_at_idx on issues(created_at desc);
create index if not exists comments_issue_created_idx on comments(issue_id, created_at);
