'use client';

import { setCommunityBan } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function BanButton({ userId, isBanned }: { userId: string; isBanned: boolean }) {
  const [arming, setArming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (isBanned) {
    return (
      <form action={setCommunityBan} onSubmit={() => setIsSaving(true)}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="ban" value="false" />
        <Button type="submit" size="sm" variant="outline" disabled={isSaving}>
          {isSaving ? '해제 중...' : '광장 차단 해제'}
        </Button>
      </form>
    );
  }

  if (!arming) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setArming(true)}>
        광장 차단...
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button type="button" size="sm" variant="outline" onClick={() => setArming(false)}>
        취소
      </Button>
      <form action={setCommunityBan} onSubmit={() => setIsSaving(true)}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="ban" value="true" />
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          disabled={isSaving}
          title="게시물이 숨겨지고 글·댓글 작성이 막혀요 (해제 시 복구)"
        >
          {isSaving ? '차단 중...' : '정말 차단'}
        </Button>
      </form>
    </div>
  );
}
