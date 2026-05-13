-- Enums
create type user_role as enum ('admin', 'faculty', 'student_mentor', 'student');
create type project_status as enum ('planning', 'in_progress', 'completed', 'on_hold');

-- Sections
create table sections (
  id          bigint generated always as identity primary key,
  name        text not null,
  department  text not null,
  year        int  not null,
  semester    int  not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Users (custom auth — keep in sync with frontend/src/lib/supabase.ts)
create table users (
  id          bigint generated always as identity primary key,
  name        text not null,
  email       text not null unique,
  password    text not null,
  role        user_role not null,
  section_id  bigint references sections(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index users_section_id_idx on users(section_id);
create index users_role_idx on users(role);

-- Teams
create table teams (
  id          bigint generated always as identity primary key,
  name        text not null,
  section_id  bigint not null references sections(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index teams_section_id_idx on teams(section_id);

-- Projects
create table projects (
  id           bigint generated always as identity primary key,
  title        text not null,
  description  text not null,
  status       project_status not null default 'planning',
  team_id      bigint references teams(id) on delete set null,
  mentor_id    bigint references users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index projects_team_id_idx on projects(team_id);
create index projects_mentor_id_idx on projects(mentor_id);
create index projects_status_idx on projects(status);

-- Announcements
create table announcements (
  id                 bigint generated always as identity primary key,
  title              text not null,
  content            text not null,
  author_id          bigint not null references users(id) on delete cascade,
  target_role        text,
  target_section_id  bigint references sections(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index announcements_author_id_idx on announcements(author_id);
create index announcements_target_section_id_idx on announcements(target_section_id);

-- updated_at auto-update trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger sections_set_updated_at      before update on sections      for each row execute function set_updated_at();
create trigger users_set_updated_at         before update on users         for each row execute function set_updated_at();
create trigger teams_set_updated_at         before update on teams         for each row execute function set_updated_at();
create trigger projects_set_updated_at      before update on projects      for each row execute function set_updated_at();
create trigger announcements_set_updated_at before update on announcements for each row execute function set_updated_at();
