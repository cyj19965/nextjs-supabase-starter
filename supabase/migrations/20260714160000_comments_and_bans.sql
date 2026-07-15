-- Comments on community posts + admin-managed community bans.
create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  nickname text,
  content text not null check (char_length(content) between 1 and 300),
  created_at timestamptz not null default now()
);

-- Ban rows are written only with the service role (no insert/delete
-- policies); members can read them because the policies below reference
-- this table with invoker rights.
create table public.community_bans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.post_comments enable row level security;
alter table public.community_bans enable row level security;

create policy "bans_select_members" on public.community_bans
  for select to authenticated using (true);

create policy "comments_select_members" on public.post_comments
  for select to authenticated using (
    not exists (select 1 from public.community_bans b where b.user_id = post_comments.user_id)
  );

create policy "comments_insert_own" on public.post_comments
  for insert with check (
    auth.uid() = user_id
    and not exists (select 1 from public.community_bans b where b.user_id = auth.uid())
  );

create policy "comments_delete_own" on public.post_comments
  for delete using (auth.uid() = user_id);

create index post_comments_post_idx on public.post_comments (post_id, created_at);

-- Banned members disappear from the feed (reversible, unlike deletion)
-- and cannot share new posts.
drop policy "posts_select_members" on public.community_posts;
create policy "posts_select_members" on public.community_posts
  for select to authenticated using (
    not exists (select 1 from public.community_bans b where b.user_id = community_posts.user_id)
  );

drop policy "posts_insert_own" on public.community_posts;
create policy "posts_insert_own" on public.community_posts
  for insert with check (
    auth.uid() = user_id
    and not exists (select 1 from public.community_bans b where b.user_id = auth.uid())
  );
