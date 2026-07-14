import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from '@/components/progress-bar';
import { getProjects, progressOf } from '@/lib/projects';
import { createClient } from '@/lib/supabase/server';

const STATUS_EMOJI: Record<string, string> = { 진행중: '🧶', 완성: '🎉', 잠듦: '💤' };

// cacheComponents mode: uncached (auth-scoped) data must render inside Suspense
export default function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <Suspense>
      <ProjectsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ProjectsContent({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: activeStatus } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect('/auth/login');

  const projects = await getProjects();
  const countOf = (status: string) => projects.filter((p) => p.status === status).length;
  const statusChips: Array<[string, string, number]> = [
    ['🧶', '진행중', countOf('진행중')],
    ['🎉', '완성', countOf('완성')],
    ['💤', '잠듦', countOf('잠듦')],
  ];
  const filtered = activeStatus ? projects.filter((p) => p.status === activeStatus) : projects;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">🧶 내 뜨개 작품</h1>
          <p className="text-sm text-muted-foreground">오늘도 한 단, 이어서 떠볼까요?</p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/projects/new">+ 새 작품</Link>
        </Button>
      </div>

      {projects.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          {statusChips.map(([emoji, label, count]) => {
            const isActive = activeStatus === label;
            return (
              <Link
                key={label}
                // Clicking the active chip clears the filter
                href={isActive ? '/projects' : `/projects?status=${encodeURIComponent(label)}`}
                className={
                  'rounded-full px-3.5 py-1 transition ' +
                  (isActive
                    ? 'bg-primary font-semibold text-primary-foreground'
                    : count > 0
                      ? 'bg-secondary hover:bg-secondary/70'
                      : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/70')
                }
              >
                {emoji} {label} {count}
              </Link>
            );
          })}
        </div>
      )}

      {activeStatus && filtered.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {activeStatus} 상태의 작품이 없어요.
          </CardContent>
        </Card>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            아직 작품이 없어요. 첫 작품을 등록하고 코를 잡아보세요!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between gap-2 text-base">
                    <span className="truncate">
                      {STATUS_EMOJI[p.status]} {p.name}
                    </span>
                    <Badge variant={p.status === '진행중' ? 'default' : 'secondary'}>
                      {p.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {p.kind ?? '기타'} · {p.current_rows}단
                    {p.goal_rows ? ` / ${p.goal_rows}단` : ''}
                  </p>
                  <ProgressBar percent={progressOf(p)} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
