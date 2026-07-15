-- Reports on community posts. One report per (post, reporter); members can
-- file and read their own, admins see all via the service role.
create table public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reason text not null check (char_length(reason) between 1 and 300),
  status text not null default '대기' check (status in ('대기', '처리됨')),
  created_at timestamptz not null default now(),
  unique (post_id, reporter_id)
);

alter table public.post_reports enable row level security;

-- Members file reports for themselves (but not on their own posts) and can
-- see only their own; admins read/update everything with the service role.
create policy "reports_insert_own" on public.post_reports
  for insert with check (
    auth.uid() = reporter_id
    and not exists (
      select 1 from public.community_posts p
      where p.id = post_reports.post_id and p.user_id = auth.uid()
    )
  );

create policy "reports_select_own" on public.post_reports
  for select using (auth.uid() = reporter_id);

create index post_reports_status_idx on public.post_reports (status, created_at);
