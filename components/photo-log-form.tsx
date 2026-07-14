'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

const MAX_FILE_MB = 5;

export function PhotoLogForm({
  projectId,
  currentRows,
}: {
  projectId: string;
  currentRows: number;
}) {
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const files = [...(fileRef.current?.files ?? [])];
    if (files.length === 0) {
      setError('사진을 선택해주세요.');
      return;
    }
    const tooBig = files.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
    if (tooBig) {
      setError(`사진 하나당 ${MAX_FILE_MB}MB까지 올릴 수 있어요.`);
      return;
    }

    setIsUploading(true);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.getClaims();
      if (authError || !data?.claims) throw new Error('로그인이 필요해요.');
      const userId = data.claims.sub as string;
      const trimmedCaption = caption.trim().slice(0, 200) || null;

      for (const file of files) {
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `${userId}/${projectId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('project-photos')
          .upload(path, file, { contentType: file.type });
        if (uploadError) throw uploadError;

        const { error: insertError } = await supabase.from('project_logs').insert({
          project_id: projectId,
          user_id: userId,
          photo_path: path,
          caption: trimmedCaption,
          rows_at: currentRows,
        });
        if (insertError) throw insertError;
      }

      setCaption('');
      if (fileRef.current) fileRef.current.value = '';
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '업로드에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={upload} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="photos">사진 (여러 장 가능)</Label>
        <Input id="photos" ref={fileRef} type="file" accept="image/*" multiple required />
        <p className="text-xs text-muted-foreground">
          지금 단수(🧶 {currentRows}단)가 함께 기록돼요.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="caption">그때의 상황 (선택)</Label>
        <Input
          id="caption"
          maxLength={200}
          placeholder="예: 소매 분리 완료! 배색 실 시작"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={isUploading}>
        {isUploading ? '올리는 중...' : '📸 기록 남기기'}
      </Button>
    </form>
  );
}
