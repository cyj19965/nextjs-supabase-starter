'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/** Shown to signed-in users who joined before nicknames existed. */
export function NicknameDialog() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  if (dismissed) return null;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) return;
    setIsSaving(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { nickname: trimmed.slice(0, 20) },
      });
      if (error) throw error;
      // user_metadata rides in the JWT, so mint a fresh token before re-render
      await supabase.auth.refreshSession();
      setDismissed(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
      <div className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-6 shadow-lg">
        <div className="space-y-1 text-center">
          <p className="text-4xl" aria-hidden>
            🧶
          </p>
          <h2 className="text-lg font-bold">닉네임을 정해주세요</h2>
          <p className="text-sm text-muted-foreground">
            이메일 대신 닉네임으로 인사드릴게요.
          </p>
        </div>
        <form onSubmit={save} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="nickname">닉네임</Label>
            <Input
              id="nickname"
              autoFocus
              required
              maxLength={20}
              placeholder="예: 뜨개하는 낮달"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setDismissed(true)}
            >
              나중에
            </Button>
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
