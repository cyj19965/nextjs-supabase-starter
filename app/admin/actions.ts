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
