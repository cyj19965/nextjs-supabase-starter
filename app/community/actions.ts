'use server';

import { createHash } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

function serviceHeaders(): Record<string, string> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  return { apikey: key, Authorization: `Bearer ${key}` };
}

async function requestIpHash(): Promise<string> {
  const h = await headers();
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
  // Store a salted hash, not the raw IP
  return createHash('sha256').update(`todays-knitting:${ip}`).digest('hex');
}

export type LikeResult = { ok: true; liked: boolean } | { ok: false; message: string };

/**
 * Toggle a like. Runs server-side so the request IP is captured here —
 * post_likes has no client write policies, so this action is the only
 * write path and the account/IP uniqueness cannot be forged around.
 */
export async function toggleLike(postId: string): Promise<LikeResult> {
  if (typeof postId !== 'string' || !/^[0-9a-f-]{36}$/.test(postId)) {
    return { ok: false, message: '잘못된 요청이에요.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return { ok: false, message: '로그인이 필요해요.' };
  const userId = data.claims.sub as string;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const existing = await fetch(
    `${base}/rest/v1/post_likes?post_id=eq.${postId}&user_id=eq.${userId}&select=post_id`,
    { headers: serviceHeaders(), cache: 'no-store' },
  );
  if (!existing.ok) return { ok: false, message: '잠시 후 다시 시도해주세요.' };
  const rows = (await existing.json()) as unknown[];

  if (rows.length > 0) {
    const res = await fetch(
      `${base}/rest/v1/post_likes?post_id=eq.${postId}&user_id=eq.${userId}`,
      { method: 'DELETE', headers: serviceHeaders(), cache: 'no-store' },
    );
    if (!res.ok) return { ok: false, message: '잠시 후 다시 시도해주세요.' };
    revalidatePath('/community');
    return { ok: true, liked: false };
  }

  const res = await fetch(`${base}/rest/v1/post_likes`, {
    method: 'POST',
    headers: { ...serviceHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ post_id: postId, user_id: userId, ip_hash: await requestIpHash() }),
    cache: 'no-store',
  });
  if (res.status === 409) {
    // Unique ip_hash violation: someone on this network already recommended it
    return { ok: false, message: '같은 네트워크에서 이미 추천된 글이에요.' };
  }
  if (!res.ok) return { ok: false, message: '잠시 후 다시 시도해주세요.' };

  revalidatePath('/community');
  return { ok: true, liked: true };
}
