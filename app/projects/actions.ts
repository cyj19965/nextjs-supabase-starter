'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PROJECT_KINDS, PROJECT_STATUSES } from '@/lib/projects';

function requireId(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string' || !/^[0-9a-f-]{36}$/.test(value)) {
    throw new Error('Invalid project id');
  }
  return value;
}

async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect('/auth/login');
  return { supabase, userId: data.claims.sub as string };
}

export async function createProject(formData: FormData) {
  const { supabase, userId } = await requireUser();

  const name = formData.get('name');
  if (typeof name !== 'string' || !name.trim()) throw new Error('작품 이름은 필수입니다');

  const kind = formData.get('kind');
  const goalRaw = formData.get('goal_rows');
  const goal = typeof goalRaw === 'string' && goalRaw ? parseInt(goalRaw, 10) : NaN;
  const text = (key: string) => {
    const v = formData.get(key);
    return typeof v === 'string' && v.trim() ? v.trim().slice(0, 200) : null;
  };

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: name.trim().slice(0, 100),
      kind: PROJECT_KINDS.includes(kind as never) ? kind : null,
      yarn: text('yarn'),
      needle: text('needle'),
      goal_rows: Number.isInteger(goal) && goal > 0 ? goal : null,
      started_at: text('started_at'),
      memo: text('memo'),
    })
    .select('id')
    .single();
  if (error) throw new Error(`insert failed: ${error.message}`);

  revalidatePath('/projects');
  redirect(`/projects/${data.id}`);
}

/**
 * Reaching the goal marks the project 완성 automatically; dropping back
 * below it (e.g. after a −1 fix) returns it to 진행중. Manually chosen
 * 잠듦 is left alone.
 */
function counterUpdate(
  next: number,
  goal: number | null,
  status: string,
): { current_rows: number; status?: string } {
  const update: { current_rows: number; status?: string } = { current_rows: next };
  if (goal) {
    if (next >= goal && status === '진행중') update.status = '완성';
    else if (next < goal && status === '완성') update.status = '진행중';
  }
  return update;
}

/** Counter core: clamps at 0, ignores unknown deltas. */
export async function adjustRows(formData: FormData) {
  const id = requireId(formData.get('id'));
  const deltaRaw = formData.get('delta');
  const delta = deltaRaw === '1' ? 1 : deltaRaw === '-1' ? -1 : 0;
  if (delta === 0) return;

  const { supabase } = await requireUser();
  const { data: current, error: selErr } = await supabase
    .from('projects')
    .select('current_rows, goal_rows, status')
    .eq('id', id)
    .maybeSingle();
  if (selErr || !current) return; // not mine (RLS) or gone

  const next = Math.max(0, current.current_rows + delta);
  const { error } = await supabase
    .from('projects')
    .update(counterUpdate(next, current.goal_rows, current.status))
    .eq('id', id);
  if (error) throw new Error(`counter update failed: ${error.message}`);

  revalidatePath(`/projects/${id}`);
  revalidatePath('/projects');
}

export async function setRows(formData: FormData) {
  const id = requireId(formData.get('id'));
  const raw = formData.get('rows');
  const rows = typeof raw === 'string' ? parseInt(raw, 10) : NaN;
  if (!Number.isInteger(rows) || rows < 0 || rows > 100000) return;

  const { supabase } = await requireUser();
  const { data: current, error: selErr } = await supabase
    .from('projects')
    .select('goal_rows, status')
    .eq('id', id)
    .maybeSingle();
  if (selErr || !current) return;

  const { error } = await supabase
    .from('projects')
    .update(counterUpdate(rows, current.goal_rows, current.status))
    .eq('id', id);
  if (error) throw new Error(`rows update failed: ${error.message}`);

  revalidatePath(`/projects/${id}`);
  revalidatePath('/projects');
}

export async function setStatus(formData: FormData) {
  const id = requireId(formData.get('id'));
  const status = formData.get('status');
  if (typeof status !== 'string' || !PROJECT_STATUSES.includes(status as never)) return;

  const { supabase } = await requireUser();
  const { error } = await supabase.from('projects').update({ status }).eq('id', id);
  if (error) throw new Error(`status update failed: ${error.message}`);

  revalidatePath(`/projects/${id}`);
  revalidatePath('/projects');
}

export async function deleteProject(formData: FormData) {
  const id = requireId(formData.get('id'));
  const { supabase } = await requireUser();
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw new Error(`delete failed: ${error.message}`);

  revalidatePath('/projects');
  redirect('/projects');
}
