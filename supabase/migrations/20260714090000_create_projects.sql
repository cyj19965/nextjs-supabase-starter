-- Knitting projects table. Every row belongs to one user; RLS below makes
-- ownership the only access path (anon key alone can read nothing).
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  kind text,
  yarn text,
  needle text,
  goal_rows int check (goal_rows is null or goal_rows > 0),
  current_rows int not null default 0 check (current_rows >= 0),
  status text not null default '진행중' check (status in ('진행중', '완성', '잠듦')),
  started_at date,
  memo text,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Owner-only for every operation. update needs BOTH using (which rows can be
-- targeted) and with check (rows may not be re-assigned to another user).
create policy "projects_select_own" on public.projects
  for select using (auth.uid() = user_id);

create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "projects_update_own" on public.projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = user_id);

create index projects_user_id_idx on public.projects (user_id);
