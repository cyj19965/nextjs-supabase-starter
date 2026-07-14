'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin';

/** Admin-only: removes a member and (via FK cascade) their projects. */
export async function adminDeleteUser(formData: FormData) {
  const callerId = await requireAdmin();

  const targetId = formData.get('userId');
  if (typeof targetId !== 'string' || !/^[0-9a-f-]{36}$/.test(targetId)) {
    throw new Error('Invalid user id');
  }
  // Self-removal belongs in /settings where the warnings live
  if (targetId === callerId) return;

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${targetId}`,
    {
      method: 'DELETE',
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
    },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`user deletion failed: ${res.status} ${body}`);
  }

  revalidatePath('/admin');
}
