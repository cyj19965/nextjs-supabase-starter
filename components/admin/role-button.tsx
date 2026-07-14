'use client';

import { setAdminRole } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function RoleButton({
  userId,
  isAdmin,
  isLastAdmin,
}: {
  userId: string;
  isAdmin: boolean;
  isLastAdmin: boolean;
}) {
  const [arming, setArming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isAdmin) {
    return (
      <form action={setAdminRole} onSubmit={() => setIsSaving(true)}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="role" value="admin" />
        <Button type="submit" size="sm" variant="outline" disabled={isSaving}>
          {isSaving ? '지정 중...' : '관리자 지정'}
        </Button>
      </form>
    );
  }

  if (isLastAdmin) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled
        title="마지막 관리자는 해제할 수 없어요. Supabase 대시보드에서만 처리할 수 있습니다."
      >
        해제 불가 (마지막 관리자)
      </Button>
    );
  }

  if (!arming) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setArming(true)}>
        관리자 해제...
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button type="button" size="sm" variant="outline" onClick={() => setArming(false)}>
        취소
      </Button>
      <form action={setAdminRole} onSubmit={() => setIsSaving(true)}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="role" value="member" />
        <Button type="submit" size="sm" variant="destructive" disabled={isSaving}>
          {isSaving ? '해제 중...' : '정말 해제'}
        </Button>
      </form>
    </div>
  );
}
