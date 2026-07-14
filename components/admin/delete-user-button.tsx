'use client';

import { adminDeleteUser } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

/** Two-step delete so a single misclick can't remove a member. */
export function DeleteUserButton({ userId, email }: { userId: string; email: string }) {
  const [arming, setArming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!arming) {
    return (
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="text-destructive"
        onClick={() => setArming(true)}
      >
        삭제
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button type="button" size="sm" variant="outline" onClick={() => setArming(false)}>
        취소
      </Button>
      <form action={adminDeleteUser} onSubmit={() => setIsDeleting(true)}>
        <input type="hidden" name="userId" value={userId} />
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          disabled={isDeleting}
          title={`${email} 영구 삭제`}
        >
          {isDeleting ? '삭제 중...' : '정말 삭제'}
        </Button>
      </form>
    </div>
  );
}
