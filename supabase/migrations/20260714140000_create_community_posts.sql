-- Community feed: photo logs a member chose to share with everyone.
-- A post snapshots nickname/project name at share time and dies with its
-- source log (cascade), so deleting the private record also unshares it.
create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  log_id uuid not null unique references public.project_logs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  nickname text,
  project_name text not null,
  photo_path text not null,
  caption text,
  rows_at int,
  created_at timestamptz not null default now()
);

alter table public.community_posts enable row level security;

-- Members-only feed: any signed-in user can read, owners write/remove
create policy "posts_select_members" on public.community_posts
  for select to authenticated using (true);

create policy "posts_insert_own" on public.community_posts
  for insert with check (auth.uid() = user_id);

create policy "posts_delete_own" on public.community_posts
  for delete using (auth.uid() = user_id);

create index community_posts_created_idx on public.community_posts (created_at desc);
