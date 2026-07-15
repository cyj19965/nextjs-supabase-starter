'use client';

import { toggleLike } from '@/app/community/actions';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export function LikeButton({
  postId,
  count,
  liked,
}: {
  postId: string;
  count: number;
  liked: boolean;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onClick = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await toggleLike(postId);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      router.refresh();
    });
  };

  return (
    <span className="flex flex-col items-end gap-0.5">
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        className={
          'flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition ' +
          (liked
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground')
        }
        title={liked ? '추천 취소' : '추천하기'}
      >
        {liked ? '🧡' : '🤍'} {count}
      </button>
      {message && <span className="text-[10px] text-destructive">{message}</span>}
    </span>
  );
}
