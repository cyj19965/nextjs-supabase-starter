'use client';

import { createClient } from '@/lib/supabase/client';
import { GoalCelebration } from '@/components/goal-celebration';
import { ProgressBar } from '@/components/progress-bar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Optimistic counter: the number moves the instant you click, while each
 * click fires one atomic RPC straight to Supabase (no server-action round
 * trip). A debounced router.refresh keeps the server-rendered parts
 * (status badge, list) in sync afterwards.
 */
export function RowCounter({
  projectId,
  initialRows,
  goalRows,
}: {
  projectId: string;
  initialRows: number;
  goalRows: number | null;
}) {
  const [rows, setRows] = useState(initialRows);
  const [syncError, setSyncError] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Server actions elsewhere (직접 입력, 목표 수정) re-render with new props
  useEffect(() => setRows(initialRows), [initialRows]);

  const adjust = (delta: number) => {
    setRows((r) => Math.max(0, r + delta)); // instant feedback
    setSyncError(false);

    const supabase = createClient();
    supabase
      .rpc('adjust_rows', { p_project_id: projectId, p_delta: delta })
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          setSyncError(true);
          return;
        }
        // Reconcile with the server's authoritative value
        setRows((data as Array<{ new_rows: number }>)[0].new_rows);
      });

    // Refresh server-rendered UI once clicking pauses
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => router.refresh(), 900);
  };

  const percent =
    goalRows && goalRows > 0 ? Math.min(100, Math.floor((rows / goalRows) * 100)) : null;
  const reached = !!(goalRows && rows >= goalRows);

  return (
    <div className="space-y-4">
      <GoalCelebration projectId={projectId} reached={reached} />
      <div className="space-y-3 rounded-3xl bg-secondary/60 p-6 text-center">
        <p className="text-sm text-muted-foreground">현재 단수</p>
        <p className="text-7xl font-extrabold tabular-nums text-primary">{rows}</p>
        {goalRows && <p className="text-sm text-muted-foreground">목표 {goalRows}단</p>}
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-14 w-14 rounded-full text-lg"
            aria-label="1단 빼기"
            onClick={() => adjust(-1)}
          >
            −1
          </Button>
          <Button
            type="button"
            size="lg"
            className="h-14 rounded-full px-12 text-xl font-bold shadow-md transition active:scale-95"
            onClick={() => adjust(1)}
          >
            +1단 🧶
          </Button>
        </div>
        {syncError && (
          <p className="text-xs text-destructive">
            저장이 밀렸어요 — 네트워크 확인 후 새로고침해주세요.
          </p>
        )}
        <ProgressBar percent={percent} />
      </div>
    </div>
  );
}
