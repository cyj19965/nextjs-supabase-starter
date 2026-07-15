'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

const REASONS = [
  '스팸/광고',
  '부적절한 사진',
  '욕설/비방',
  '뜨개와 무관한 내용',
  '도용된 사진',
];

export function ReportButton({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [detail, setDetail] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // "직접 입력" uses the free-text field; presets use the picked label
    const finalReason =
      reason === '직접 입력' ? detail.trim() : detail.trim() ? `${reason} — ${detail.trim()}` : reason;
    if (!finalReason) {
      setError('신고 사유를 입력해주세요.');
      return;
    }
    setState('saving');
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.getClaims();
      if (authError || !data?.claims) throw new Error('로그인이 필요해요.');
      const { error } = await supabase.from('post_reports').insert({
        post_id: postId,
        reporter_id: data.claims.sub as string,
        reason: finalReason.slice(0, 300),
      });
      if (error) {
        // Unique violation = already reported by me
        setError(
          error.code === '23505'
            ? '이미 신고한 게시물이에요.'
            : '신고하지 못했어요. 본인 게시물은 신고할 수 없어요.',
        );
        setState('idle');
        return;
      }
      setState('done');
    } catch {
      setError('신고하지 못했어요. 잠시 후 다시 시도해주세요.');
      setState('idle');
    }
  };

  if (state === 'done') {
    return <span className="text-xs text-muted-foreground">신고가 접수됐어요. 고마워요 🙏</span>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground hover:text-destructive"
      >
        신고
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="w-full space-y-2 rounded-lg border border-black/10 p-2">
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="h-8 w-full rounded-md border border-black/10 bg-background px-2 text-xs"
      >
        {REASONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
        <option value="직접 입력">직접 입력</option>
      </select>
      <input
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        maxLength={300}
        placeholder={reason === '직접 입력' ? '신고 사유를 적어주세요' : '자세한 내용 (선택)'}
        className="h-8 w-full rounded-md border border-black/10 bg-background px-2 text-xs focus:border-primary focus:outline-none"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted-foreground"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={state === 'saving'}
          className="text-xs font-semibold text-destructive disabled:opacity-40"
        >
          {state === 'saving' ? '접수 중...' : '신고하기'}
        </button>
      </div>
    </form>
  );
}
