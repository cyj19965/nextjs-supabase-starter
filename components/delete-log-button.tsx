'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteLogButton({ logId, photoPath }: { logId: string; photoPath: string }) {
  const [arming, setArming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const remove = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('project_logs').delete().eq('id', logId);
      if (error) throw error;
      // Storage cleanup is best-effort; the DB row is the source of truth
      await supabase.storage.from('project-photos').remove([photoPath]);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!arming) {
    return (
      <button
        type="button"
        onClick={() => setArming(true)}
        className="text-xs text-muted-foreground hover:text-destructive"
      >
        삭제
      </button>
    );
  }
  return (
    <span className="flex gap-2 text-xs">
      <button type="button" onClick={() => setArming(false)} className="text-muted-foreground">
        취소
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={isDeleting}
        className="font-semibold text-destructive"
      >
        {isDeleting ? '삭제 중...' : '정말 삭제'}
      </button>
    </span>
  );
}
