'use client';

import { createClient } from '@/lib/supabase/client';
import type { PostComment } from '@/lib/community';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const PREVIEW_COUNT = 3;

export function PostComments({
  postId,
  myId,
  comments,
}: {
  postId: string;
  myId: string;
  comments: PostComment[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setIsSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.getClaims();
      if (authError || !data?.claims) throw new Error('로그인이 필요해요.');
      const nickname =
        (data.claims.user_metadata as { nickname?: string } | undefined)?.nickname ?? null;
      const { error } = await supabase.from('post_comments').insert({
        post_id: postId,
        user_id: data.claims.sub as string,
        nickname,
        content: trimmed.slice(0, 300),
      });
      if (error) throw error;
      setText('');
      router.refresh();
    } catch {
      // Insert is refused for banned members (RLS) — say so plainly
      setError('댓글을 남기지 못했어요. 광장 이용이 제한된 상태일 수 있어요.');
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (commentId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('post_comments').delete().eq('id', commentId);
    if (!error) router.refresh();
  };

  const visible = expanded ? comments : comments.slice(0, PREVIEW_COUNT);
  const hiddenCount = comments.length - PREVIEW_COUNT;

  return (
    <div className="space-y-2 border-t border-black/5 pt-2">
      {visible.map((comment) => (
        <p key={comment.id} className="text-xs leading-relaxed">
          <span className="font-semibold">{comment.nickname ?? '어느 뜨개인'}</span>{' '}
          {comment.content}
          {comment.user_id === myId && (
            <button
              type="button"
              onClick={() => remove(comment.id)}
              className="ml-1.5 text-muted-foreground hover:text-destructive"
            >
              ×
            </button>
          )}
        </p>
      ))}

      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs text-muted-foreground hover:text-primary"
        >
          {hiddenCount > 0 ? `💬 댓글 ${hiddenCount}개 더 보기 · 댓글 달기` : '💬 댓글 달기'}
        </button>
      ) : (
        <>
          <form onSubmit={add} className="flex items-center gap-1.5">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={300}
              autoFocus
              placeholder="댓글 남기기..."
              className="h-7 w-full rounded-full border border-black/10 bg-background px-3 text-xs focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSaving || !text.trim()}
              className="shrink-0 text-xs font-semibold text-primary disabled:opacity-40"
            >
              {isSaving ? '...' : '남기기'}
            </button>
          </form>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            접기
          </button>
        </>
      )}
    </div>
  );
}
