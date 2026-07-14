-- Photo log entries: snapshots of a project at a moment in time.
create table public.project_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  photo_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

alter table public.project_logs enable row level security;

create policy "logs_select_own" on public.project_logs
  for select using (auth.uid() = user_id);

create policy "logs_insert_own" on public.project_logs
  for insert with check (auth.uid() = user_id);

create policy "logs_delete_own" on public.project_logs
  for delete using (auth.uid() = user_id);

create index project_logs_project_idx on public.project_logs (project_id);

-- Public-read bucket (paths contain user id + random uuid); writes and
-- deletes are restricted to the owner's folder.
insert into storage.buckets (id, name, public)
values ('project-photos', 'project-photos', true)
on conflict (id) do nothing;

create policy "photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'project-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'project-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
