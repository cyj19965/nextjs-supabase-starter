'use client';

import { deleteAccount } from '@/app/settings/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

const CONFIRM_PHRASE = '탈퇴합니다';

export function DeleteAccount() {
  const [expanded, setExpanded] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!expanded) {
    return (
      <Button variant="ghost" className="text-destructive" onClick={() => setExpanded(true)}>
        회원 탈퇴...
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-destructive/40 p-4">
      <p className="text-sm">
        탈퇴하면 계정과 <strong>모든 뜨개 작품 기록이 즉시 삭제</strong>되고 되돌릴 수 없어요.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="confirm-delete">
          확인을 위해 <strong>{CONFIRM_PHRASE}</strong>를 입력해주세요
        </Label>
        <Input
          id="confirm-delete"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={CONFIRM_PHRASE}
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => setExpanded(false)}>
          취소
        </Button>
        <form
          action={deleteAccount}
          onSubmit={(e) => {
            if (confirmText !== CONFIRM_PHRASE) {
              e.preventDefault();
              return;
            }
            setIsDeleting(true);
          }}
        >
          <Button
            type="submit"
            variant="destructive"
            disabled={confirmText !== CONFIRM_PHRASE || isDeleting}
          >
            {isDeleting ? '삭제 중...' : '영구 탈퇴'}
          </Button>
        </form>
      </div>
    </div>
  );
}
