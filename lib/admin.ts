import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface AdminUser {
  id: string;
  email: string;
  nickname: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  isAdmin: boolean;
  isBanned: boolean;
  projectCount: number;
}

export interface AdminStats {
  userCount: number;
  projectCount: number;
  finishedCount: number;
}

/** Role lives in app_metadata — users cannot change it themselves. */
export function isAdminClaims(claims: Record<string, unknown> | undefined | null): boolean {
  return (
    (claims?.app_metadata as { role?: string } | undefined)?.role === 'admin'
  );
}

/** Gate for admin pages/actions; sends non-admins back to their projects. */
export async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect('/auth/login');
  if (!isAdminClaims(data.claims)) redirect('/projects');
  return data.claims.sub as string;
}

function serviceHeaders(): Record<string, string> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return { apikey: key, Authorization: `Bearer ${key}` };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getAdminData(): Promise<{ users: AdminUser[]; stats: AdminStats }> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const headers = serviceHeaders();

  const [usersRes, projectsRes, bansRes] = await Promise.all([
    fetch(`${base}/auth/v1/admin/users?per_page=200`, { headers, cache: 'no-store' }),
    fetch(`${base}/rest/v1/projects?select=user_id,status`, { headers, cache: 'no-store' }),
    fetch(`${base}/rest/v1/community_bans?select=user_id`, { headers, cache: 'no-store' }),
  ]);
  if (!usersRes.ok) throw new Error(`admin users fetch failed: ${usersRes.status}`);
  if (!projectsRes.ok) throw new Error(`projects fetch failed: ${projectsRes.status}`);
  if (!bansRes.ok) throw new Error(`bans fetch failed: ${bansRes.status}`);
  const bannedIds = new Set(
    ((await bansRes.json()) as Array<{ user_id: string }>).map((b) => b.user_id),
  );

  const projects = (await projectsRes.json()) as Array<{ user_id: string; status: string }>;
  const countByUser = new Map<string, number>();
  for (const p of projects) {
    countByUser.set(p.user_id, (countByUser.get(p.user_id) ?? 0) + 1);
  }

  const users: AdminUser[] = ((await usersRes.json()) as any).users.map((u: any) => ({
    id: u.id,
    email: u.email,
    nickname: u.user_metadata?.nickname ?? null,
    createdAt: u.created_at,
    lastSignInAt: u.last_sign_in_at ?? null,
    isAdmin: u.app_metadata?.role === 'admin',
    isBanned: bannedIds.has(u.id),
    projectCount: countByUser.get(u.id) ?? 0,
  }));

  return {
    users,
    stats: {
      userCount: users.length,
      projectCount: projects.length,
      finishedCount: projects.filter((p) => p.status === '완성').length,
    },
  };
}
