'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Deletes the signed-in user's own account. The target id comes from the
 * session (never from form input), so this cannot delete anyone else.
 * Projects are removed by the FK's on delete cascade.
 */
export async function deleteAccount() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect('/auth/login');
  const userId = data.claims.sub as string;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${userId}`,
    {
      method: 'DELETE',
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      cache: 'no-store',
    },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`account deletion failed: ${res.status} ${body}`);
  }

  await supabase.auth.signOut();
  redirect('/?farewell=1');
}
