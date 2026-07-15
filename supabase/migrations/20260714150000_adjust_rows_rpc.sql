-- Atomic counter step: clamp at 0 and re-evaluate completion in one
-- statement, so the client needs a single round trip per click.
-- security invoker: RLS still restricts the update to the owner's rows.
create or replace function public.adjust_rows(p_project_id uuid, p_delta int)
returns table (new_rows int, new_status text)
language sql
security invoker
as $$
  update public.projects
  set current_rows = greatest(0, current_rows + p_delta),
      status = case
        when goal_rows is not null
          and greatest(0, current_rows + p_delta) >= goal_rows
          and status = '진행중' then '완성'
        when goal_rows is not null
          and greatest(0, current_rows + p_delta) < goal_rows
          and status = '완성' then '진행중'
        else status
      end
  where id = p_project_id
  returning current_rows, status;
$$;
