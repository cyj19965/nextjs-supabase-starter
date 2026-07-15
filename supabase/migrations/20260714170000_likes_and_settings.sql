-- Post likes with double dedup: one like per account AND per IP hash.
-- No insert/delete policies on purpose - writes go through a server
-- action using the service role, which is the only place the real
-- request IP can be captured (a direct PostgREST call cannot forge it).
create table public.post_likes (
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  ip_hash text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create unique index post_likes_ip_unique on public.post_likes (post_id, ip_hash);

alter table public.post_likes enable row level security;

create policy "likes_select_members" on public.post_likes
  for select to authenticated using (true);

-- Single-row community settings; admin-tunable via service role.
create table public.community_settings (
  id int primary key default 1 check (id = 1),
  popular_threshold int not null default 5 check (popular_threshold >= 1)
);

insert into public.community_settings (id) values (1);

alter table public.community_settings enable row level security;

create policy "settings_select_members" on public.community_settings
  for select to authenticated using (true);
