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
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const addFiles = (incoming: File[]) => {
    const images = incoming.filter((f) => f.type.startsWith('image/'));
    if (images.length > 0) setFiles((prev) => [...prev, ...images]);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const pasted = [...e.clipboardData.files];
    if (pasted.some((f) => f.type.startsWith('image/'))) {
      e.preventDefault();
      addFiles(pasted);
    }
  };

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (files.length === 0) {
      setError('사진을 선택하거나 붙여넣어 주세요.');
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
        // Pasted images are all named image.png — derive the extension
        // from the MIME type instead of the filename
        const ext = (file.type.split('/')[1] || 'jpg').toLowerCase();
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

      setFiles([]);
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
    <form onSubmit={upload} onPaste={onPaste} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="photos">사진 (여러 장 가능)</Label>
        <Input
          id="photos"
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            addFiles([...(e.target.files ?? [])]);
            e.target.value = ''; // allow re-selecting the same file
          }}
        />
        <p className="text-xs text-muted-foreground">
          캡처한 이미지를 <strong>Ctrl+V</strong>로 붙여넣어도 돼요 · 지금 단수(🧶 {currentRows}
          단)가 함께 기록돼요.
        </p>
      </div>

      {files.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs"
            >
              📷 {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
              <button
                type="button"
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-muted-foreground hover:text-destructive"
                aria-label={`${file.name} 제거`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

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
        {isUploading ? '올리는 중...' : `📸 기록 남기기${files.length > 0 ? ` (${files.length}장)` : ''}`}
      </Button>
    </form>
  );
}
