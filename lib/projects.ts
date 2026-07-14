import { createClient } from '@/lib/supabase/server';

export const PROJECT_KINDS = ['목도리', '모자', '가디건', '장갑', '인형', '가방', '기타'] as const;
export const PROJECT_STATUSES = ['진행중', '완성', '잠듦'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Project {
  id: string;
  user_id: string;
  name: string;
  kind: string | null;
  yarn: string | null;
  needle: string | null;
  goal_rows: number | null;
  current_rows: number;
  status: ProjectStatus;
  started_at: string | null;
  memo: string | null;
  created_at: string;
}

/**
 * Progress percent (0-100) or null when no goal is set. Floors instead of
 * rounding so 239/240 reads 99% — 100% must mean the goal is actually met.
 */
export function progressOf(project: Project): number | null {
  if (!project.goal_rows) return null;
  return Math.min(100, Math.floor((project.current_rows / project.goal_rows) * 100));
}

const STATUS_ORDER: Record<ProjectStatus, number> = { 진행중: 0, 잠듦: 1, 완성: 2 };

/** All projects of the signed-in user (RLS scopes the query). */
export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`projects select failed: ${error.message}`);
  return (data as Project[]).sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`project select failed: ${error.message}`);
  return data as Project | null;
}

export interface ProjectLog {
  id: string;
  project_id: string;
  user_id: string;
  photo_path: string;
  caption: string | null;
  created_at: string;
}

export async function getProjectLogs(projectId: string): Promise<ProjectLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('project_logs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`project_logs select failed: ${error.message}`);
  return data as ProjectLog[];
}

/** Bucket is public; the path itself (uid + uuid) is the access control. */
export function photoUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-photos/${path}`;
}
