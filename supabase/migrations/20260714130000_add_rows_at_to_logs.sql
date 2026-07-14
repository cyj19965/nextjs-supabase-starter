-- Snapshot of the row counter at the moment a photo log was taken
alter table public.project_logs add column rows_at int;
