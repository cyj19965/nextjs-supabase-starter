import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DeleteLogButton } from '@/components/delete-log-button';
import { ShareLogButton } from '@/components/share-log-button';
import { getSharedPostIds } from '@/lib/community';
import { PhotoLogForm } from '@/components/photo-log-form';
import { RowCounter } from '@/components/row-counter';
import { ZoomablePhoto } from '@/components/zoomable-photo';
import { PROJECT_STATUSES, getProject, getProjectLogs, photoUrl } from '@/lib/projects';
import { createClient } from '@/lib/supabase/server';
import { deleteProject, setGoal, setRows, setStatus } from '../actions';
import { Suspense } from 'react';

// cacheComponents mode: uncached (auth-scoped) data must render inside Suspense
export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense>
      <ProjectContent params={params} />
    </Suspense>
  );
}

async function ProjectContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect('/auth/login');

  const [project, logs] = await Promise.all([getProject(id), getProjectLogs(id)]);
  const sharedPostIds = await getSharedPostIds(logs.map((l) => l.id));
  // Stale links (e.g. a tab left open after deletion) get a friendly notice
  // instead of a bare 404. RLS also lands here for other users' projects.
  if (!project) {
    return (
      <div className="mx-auto w-full max-w-lg space-y-4 p-5">
        <Link href="/projects" className="text-sm text-muted-foreground hover:underline">
          ← 목록으로
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-5xl" aria-hidden>
              🧺
            </p>
            <p className="font-semibold">삭제되었거나 찾을 수 없는 작품이에요</p>
            <p className="text-sm text-muted-foreground">
              다른 곳에서 이미 정리한 작품일 수 있어요.
            </p>
            <Button asChild>
              <Link href="/projects">내 작품 목록 보기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const facts: Array<[string, string]> = [];
  if (project.kind) facts.push(['종류', project.kind]);
  if (project.yarn) facts.push(['실', project.yarn]);
  if (project.needle) facts.push(['바늘', project.needle]);
  if (project.started_at) facts.push(['시작일', project.started_at]);

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 p-5">
      <Link href="/projects" className="text-sm text-muted-foreground hover:underline">
        ← 목록으로
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="truncate">{project.name}</span>
            <Badge variant={project.status === '진행중' ? 'default' : 'secondary'}>
              {project.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Counter — the heart of the app (optimistic, direct-to-Supabase) */}
          <RowCounter
            projectId={project.id}
            initialRows={project.current_rows}
            goalRows={project.goal_rows}
          />
          <div className="space-y-2">
            <form action={setRows} className="mx-auto flex max-w-56 items-center gap-2">
              <input type="hidden" name="id" value={project.id} />
              <Input
                name="rows"
                type="number"
                min={0}
                placeholder={`${project.current_rows}`}
                aria-label="단수 직접 입력"
                className="h-8 text-center"
              />
              <Button type="submit" variant="ghost" size="sm" className="shrink-0">
                단수 입력
              </Button>
            </form>
            <form action={setGoal} className="mx-auto flex max-w-56 items-center gap-2">
              <input type="hidden" name="id" value={project.id} />
              <Input
                name="goal"
                type="number"
                min={1}
                placeholder={project.goal_rows ? `${project.goal_rows}` : '목표 없음'}
                aria-label="목표 단수 수정 (비우면 목표 제거)"
                className="h-8 text-center"
              />
              <Button type="submit" variant="ghost" size="sm" className="shrink-0">
                목표 수정
              </Button>
            </form>
          </div>

          {facts.length > 0 && (
            <dl className="grid grid-cols-2 gap-3">
              {facts.map(([label, value]) => (
                <div key={label} className="rounded-lg border p-3">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {project.memo && (
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">패턴 메모</p>
              <p className="whitespace-pre-wrap text-sm">{project.memo}</p>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">상태:</span>
            {/* One form per status: submitter name/value is unreliable with
                server actions, so the value rides in a hidden input */}
            {PROJECT_STATUSES.map((status) => (
              <form key={status} action={setStatus}>
                <input type="hidden" name="id" value={project.id} />
                <input type="hidden" name="status" value={status} />
                <Button
                  type="submit"
                  size="sm"
                  variant={project.status === status ? 'default' : 'outline'}
                >
                  {status}
                </Button>
              </form>
            ))}
          </div>

          <form action={deleteProject} className="border-t pt-4">
            <input type="hidden" name="id" value={project.id} />
            <Button type="submit" variant="ghost" size="sm" className="text-destructive">
              이 작품 삭제
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">📸 뜨개 기록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <PhotoLogForm projectId={project.id} currentRows={project.current_rows} />
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              아직 기록이 없어요. 지금 모습을 남겨두면 완성했을 때 처음이 더 뭉클해요.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {logs.map((log) => (
                <figure key={log.id} className="space-y-1.5">
                  <div className="aspect-square overflow-hidden rounded-xl">
                    <ZoomablePhoto
                      src={photoUrl(log.photo_path)}
                      alt={log.caption ?? '뜨개 기록 사진'}
                      projectName={project.name}
                      rowsAt={log.rows_at}
                      nickname={null}
                      caption={log.caption}
                      createdAt={log.created_at}
                      thumbClassName="h-full w-full object-cover"
                    />
                  </div>
                  <figcaption className="space-y-0.5 px-0.5">
                    {log.caption && <p className="text-sm leading-snug">{log.caption}</p>}
                    <p className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {log.rows_at !== null && (
                          <span className="font-semibold text-primary">🧶 {log.rows_at}단 · </span>
                        )}
                        {log.created_at.slice(0, 10)}
                      </span>
                      <span className="flex items-center gap-2">
                        <ShareLogButton
                          logId={log.id}
                          projectName={project.name}
                          photoPath={log.photo_path}
                          caption={log.caption}
                          rowsAt={log.rows_at}
                          postId={sharedPostIds.get(log.id) ?? null}
                        />
                        <DeleteLogButton logId={log.id} photoPath={log.photo_path} />
                      </span>
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
