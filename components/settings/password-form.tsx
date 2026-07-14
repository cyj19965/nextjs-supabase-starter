'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export function PasswordForm() {
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (password !== repeat) {
      setMessage({ ok: false, text: '비밀번호가 서로 달라요.' });
      return;
    }
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword('');
      setRepeat('');
      setMessage({ ok: true, text: '비밀번호를 바꿨어요.' });
    } catch (err: unknown) {
      setMessage({
        ok: false,
        text: err instanceof Error ? err.message : '변경에 실패했어요. 다시 시도해주세요.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="new-password">새 비밀번호</Label>
        <Input
          id="new-password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="repeat-password">새 비밀번호 확인</Label>
        <Input
          id="repeat-password"
          type="password"
          required
          minLength={6}
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
        />
      </div>
      {message && (
        <p className={`text-sm ${message.ok ? 'text-emerald-600' : 'text-destructive'}`}>
          {message.text}
        </p>
      )}
      <Button type="submit" disabled={isSaving}>
        {isSaving ? '변경 중...' : '비밀번호 변경'}
      </Button>
    </form>
  );
}
