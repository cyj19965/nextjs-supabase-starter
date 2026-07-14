'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function NicknameForm({ currentNickname }: { currentNickname: string }) {
  const [nickname, setNickname] = useState(currentNickname);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { nickname: trimmed.slice(0, 20) },
      });
      if (error) throw error;
      // nickname rides in the JWT, so mint a fresh token before re-render
      await supabase.auth.refreshSession();
      setMessage({ ok: true, text: '닉네임을 바꿨어요 🧶' });
      router.refresh();
    } catch (err: unknown) {
      setMessage({
        ok: false,
        text: err instanceof Error ? err.message : '저장에 실패했어요. 다시 시도해주세요.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="nickname">닉네임</Label>
        <Input
          id="nickname"
          required
          maxLength={20}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>
      {message && (
        <p className={`text-sm ${message.ok ? 'text-emerald-600' : 'text-destructive'}`}>
          {message.text}
        </p>
      )}
      <Button type="submit" disabled={isSaving || nickname.trim() === currentNickname}>
        {isSaving ? '저장 중...' : '닉네임 변경'}
      </Button>
    </form>
  );
}
