export function ProgressBar({ percent }: { percent: number | null }) {
  if (percent === null) {
    return <p className="text-xs text-muted-foreground">목표 단수 미설정</p>;
  }
  return (
    <div className="space-y-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${percent >= 100 ? 'bg-emerald-500' : 'bg-rose-400'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{percent}%</p>
    </div>
  );
}
