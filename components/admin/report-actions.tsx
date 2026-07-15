'use client';

import { deleteReportedPost, resolveReport } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function ReportActions({
  reportId,
  postId,
  postExists,
}: {
  reportId: string;
  postId: string;
  postExists: boolean;
}) {
  const [arming, setArming] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={resolveReport}>
        <input type="hidden" name="reportId" value={reportId} />
        <Button type="submit" size="sm" variant="outline">
          처리 완료
        </Button>
      </form>
      {postExists &&
        (arming ? (
          <div className="flex items-center gap-1.5">
            <Button type="button" size="sm" variant="outline" onClick={() => setArming(false)}>
              취소
            </Button>
            <form action={deleteReportedPost}>
              <input type="hidden" name="postId" value={postId} />
              <Button type="submit" size="sm" variant="destructive">
                정말 삭제
              </Button>
            </form>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-destructive"
            onClick={() => setArming(true)}
          >
            게시물 삭제
          </Button>
        ))}
    </div>
  );
}
