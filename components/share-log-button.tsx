'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ShareProps {
  logId: string;
  projectName: string;
  photoPath: string;
  caption: string | null;
  rowsAt: number | null;
  /** community_posts.id when already shared */
  postId: string | null;
}

export function ShareLogButton({ logId, projectName, photoPath, caption, rowsAt, postId }: ShareProps) {
  const [isWorking, setIsWorking] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setIsWorking(true);
    try {
      const supabase = createClient();
      if (postId) {
        const { error } = await supabase.from('community_posts').delete().eq('id', postId);
        if (error) throw error;
      } else {
        const { data, error: authError } = await supabase.auth.getClaims();
        if (authError || !data?.claims) throw new Error('로그인이 필요해요.');
        const nickname =
          (data.claims.user_metadata as { nickname?: string } | undefined)?.nickname ?? null;
        const { error } = await supabase.from('community_posts').insert({
          log_id: logId,
          user_id: data.claims.sub as string,
          nickname,
          project_name: projectName,
          photo_path: photoPath,
          caption,
          rows_at: rowsAt,
        });
        if (error) throw error;
      }
      router.refresh();
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isWorking}
      className={
        'text-xs ' +
        (postId
          ? 'font-semibold text-primary hover:underline'
          : 'text-muted-foreground hover:text-primary')
      }
      title={postId ? '광장에서 내리기' : '뜨개 광장에 공유하기'}
    >
      {isWorking ? '...' : postId ? '🧺 공유중' : '광장에 공유'}
    </button>
  );
}
