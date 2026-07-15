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

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  nickname: string | null;
  content: string;
  created_at: string;
}

/** Comments for a set of posts, oldest-first, grouped by post. */
export async function getCommentsForPosts(
  postIds: string[],
): Promise<Map<string, PostComment[]>> {
  if (postIds.length === 0) return new Map();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('post_comments')
    .select('*')
    .in('post_id', postIds)
    .order('created_at', { ascending: true });
  if (error) throw new Error(`post_comments select failed: ${error.message}`);
  const grouped = new Map<string, PostComment[]>();
  for (const comment of data as PostComment[]) {
    const list = grouped.get(comment.post_id) ?? [];
    list.push(comment);
    grouped.set(comment.post_id, list);
  }
  return grouped;
}

export interface LikeData {
  counts: Map<string, number>;
  likedByMe: Set<string>;
}

export async function getLikeData(postIds: string[], myId: string): Promise<LikeData> {
  if (postIds.length === 0) return { counts: new Map(), likedByMe: new Set() };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('post_likes')
    .select('post_id, user_id')
    .in('post_id', postIds);
  if (error) throw new Error(`post_likes select failed: ${error.message}`);
  const counts = new Map<string, number>();
  const likedByMe = new Set<string>();
  for (const like of data as Array<{ post_id: string; user_id: string }>) {
    counts.set(like.post_id, (counts.get(like.post_id) ?? 0) + 1);
    if (like.user_id === myId) likedByMe.add(like.post_id);
  }
  return { counts, likedByMe };
}

/** Admin-tunable number of likes that makes a post "popular". */
export async function getPopularThreshold(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('community_settings')
    .select('popular_threshold')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw new Error(`community_settings select failed: ${error.message}`);
  return data?.popular_threshold ?? 5;
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
