'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';

function requireUserId(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string' || !/^[0-9a-f-]{36}$/.test(value)) {
    throw new Error('Invalid user id');
  }
  return value;
}

function serviceHeaders(): Record<string, string> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return { apikey: key, Authorization: `Bearer ${key}` };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function fetchAllUsers(): Promise<any[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users?per_page=200`,
    { headers: serviceHeaders(), cache: 'no-store' },
  );
  if (!res.ok) throw new Error(`admin users fetch failed: ${res.status}`);
  return ((await res.json()) as any).users;
}

/**
 * Admin-only: removes a member and (via FK cascade) their projects.
 * Admin accounts must have their role revoked first — this keeps
 * "delete" from silently bypassing the last-admin protection.
 */
export async function adminDeleteUser(formData: FormData) {
  const callerId = await requireAdmin();
  const targetId = requireUserId(formData.get('userId'));
  // Self-removal belongs in /settings where the warnings live
  if (targetId === callerId) return;

  const target = (await fetchAllUsers()).find((u) => u.id === targetId);
  if (!target) return;
  if (target.app_metadata?.role === 'admin') return; // revoke admin first

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${targetId}`,
    { method: 'DELETE', headers: serviceHeaders(), cache: 'no-store' },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`user deletion failed: ${res.status} ${body}`);
  }

  revalidatePath('/admin');
}

/**
 * Bans or unbans a member from the community feed. Banned members keep
 * their private projects; their posts are hidden (not deleted) and they
 * cannot share or comment — enforced by RLS policies referencing the
 * community_bans table. Admins cannot be banned.
 */
export async function setCommunityBan(formData: FormData) {
  await requireAdmin();
  const targetId = requireUserId(formData.get('userId'));
  const ban = formData.get('ban') === 'true';

  const target = (await fetchAllUsers()).find((u) => u.id === targetId);
  if (!target) return;
  if (ban && target.app_metadata?.role === 'admin') return;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const res = ban
    ? await fetch(`${base}/rest/v1/community_bans`, {
        method: 'POST',
        headers: {
          ...serviceHeaders(),
          'Content-Type': 'application/json',
          Prefer: 'resolution=ignore-duplicates',
        },
        body: JSON.stringify({ user_id: targetId }),
        cache: 'no-store',
      })
    : await fetch(`${base}/rest/v1/community_bans?user_id=eq.${targetId}`, {
        method: 'DELETE',
        headers: serviceHeaders(),
        cache: 'no-store',
      });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ban update failed: ${res.status} ${body}`);
  }

  revalidatePath('/admin');
  revalidatePath('/community');
}

/** Admin-tunable: likes needed for a post to enter the popular section. */
export async function setPopularThreshold(formData: FormData) {
  await requireAdmin();
  const raw = formData.get('threshold');
  const threshold = typeof raw === 'string' ? parseInt(raw, 10) : NaN;
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > 100000) return;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/community_settings?id=eq.1`,
    {
      method: 'PATCH',
      headers: { ...serviceHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ popular_threshold: threshold }),
      cache: 'no-store',
    },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`threshold update failed: ${res.status} ${body}`);
  }

  revalidatePath('/admin');
  revalidatePath('/community');
}

/**
 * Grants or revokes the admin role. Revoking the last remaining admin is
 * refused — that account can only be handled from the Supabase dashboard,
 * so the app can never reach a zero-admin state.
 */
export async function setAdminRole(formData: FormData) {
  await requireAdmin();
  const targetId = requireUserId(formData.get('userId'));
  const makeAdmin = formData.get('role') === 'admin';

  const users = await fetchAllUsers();
  const target = users.find((u) => u.id === targetId);
  if (!target) return;

  if (!makeAdmin) {
    if (target.app_metadata?.role !== 'admin') return;
    const adminCount = users.filter((u) => u.app_metadata?.role === 'admin').length;
    if (adminCount <= 1) return; // last admin stays
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${targetId}`,
    {
      method: 'PUT',
      headers: { ...serviceHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_metadata: { role: makeAdmin ? 'admin' : null } }),
      cache: 'no-store',
    },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`role update failed: ${res.status} ${body}`);
  }

  revalidatePath('/admin');
}
