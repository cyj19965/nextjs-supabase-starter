'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/** Feed-side unshare for my own posts (the private log stays). */
export function DeletePostButton({ postId }: { postId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const remove = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('community_posts').delete().eq('id', postId);
      if (error) throw error;
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={remove}
      disabled={isDeleting}
      className="text-xs text-muted-foreground hover:text-destructive"
    >
      {isDeleting ? '내리는 중...' : '내리기'}
    </button>
  );
}
