import { createClient } from '@/lib/supabase/server';

export interface CommunityPost {
  id: string;
  log_id: string;
  user_id: string;
  nickname: string | null;
  project_name: string;
  photo_path: string;
  caption: string | null;
  rows_at: number | null;
  created_at: string;
}

/** Newest-first feed; RLS limits reading to signed-in members. */
export async function getCommunityPosts(limit = 60): Promise<CommunityPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`community_posts select failed: ${error.message}`);
  return data as CommunityPost[];
}

/** Map of log_id -> post id for my shared logs of one project. */
export async function getSharedPostIds(logIds: string[]): Promise<Map<string, string>> {
  if (logIds.length === 0) return new Map();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('community_posts')
    .select('id, log_id')
    .in('log_id', logIds);
  if (error) throw new Error(`community_posts lookup failed: ${error.message}`);
  return new Map((data as Array<{ id: string; log_id: string }>).map((p) => [p.log_id, p.id]));
}
