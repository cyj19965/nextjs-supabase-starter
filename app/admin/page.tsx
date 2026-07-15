import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BanButton } from '@/components/admin/ban-button';
import { DeleteUserButton } from '@/components/admin/delete-user-button';
import { ReportActions } from '@/components/admin/report-actions';
import { RoleButton } from '@/components/admin/role-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { setPopularThreshold } from '@/app/admin/actions';
import { getAdminData, getReports, requireAdmin } from '@/lib/admin';
import { getPopularThreshold } from '@/lib/community';
import { photoUrl } from '@/lib/projects';

// cacheComponents mode: uncached (auth-scoped) data must render inside Suspense
export default function AdminPage() {
  return (
    <Suspense>
      <AdminContent />
    </Suspense>
  );
}

function formatDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '-';
}

async function AdminContent() {
  const callerId = await requireAdmin();
  const [{ users, stats }, popularThreshold, reports] = await Promise.all([
    getAdminData(),
    getPopularThreshold(),
    getReports(),
  ]);
  const adminCount = users.filter((u) => u.isAdmin).length;
  const pendingReports = reports.filter((r) => r.status === '대기').length;

  const statCards: Array<[string, number]> = [
    ['전체 회원', stats.userCount],
    ['전체 작품', stats.projectCount],
    ['완성 작품', stats.finishedCount],
  ];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-5">
      <h1 className="text-2xl font-bold">🛠️ 관리자</h1>

      <div className="grid grid-cols-3 gap-3">
        {statCards.map(([label, value]) => (
          <Card key={label}>
            <CardContent className="py-4 text-center">
              <p className="text-3xl font-extrabold text-primary">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            🚨 신고 게시물
            {pendingReports > 0 && <Badge variant="destructive">대기 {pendingReports}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">접수된 신고가 없어요.</p>
          ) : (
            reports.map((r) => (
              <div
                key={r.id}
                className={
                  'flex flex-wrap items-start gap-3 rounded-xl border p-3 ' +
                  (r.status === '대기' ? 'border-destructive/30' : 'opacity-60')
                }
              >
                {r.postPhotoPath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoUrl(r.postPhotoPath)}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                    삭제됨
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    사유: {r.reason}
                    {r.status === '처리됨' && <Badge variant="secondary">처리됨</Badge>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    신고자 {r.reporterNickname ?? '익명'} · {r.createdAt.slice(0, 10)}
                    {r.postProjectName && ` · 대상: ${r.postNickname ?? '?'}의 ${r.postProjectName}`}
                  </p>
                  {r.status === '대기' && (
                    <ReportActions
                      reportId={r.id}
                      postId={r.postId}
                      postExists={!!r.postPhotoPath}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">광장 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={setPopularThreshold} className="flex flex-wrap items-center gap-2">
            <span className="text-sm">추천</span>
            <Input
              name="threshold"
              type="number"
              min={1}
              defaultValue={popularThreshold}
              className="h-9 w-24 text-center"
              aria-label="인기글 기준 추천 수"
            />
            <span className="text-sm">회 이상이면 🔥 인기글에 노출</span>
            <Button type="submit" size="sm">
              저장
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">회원 목록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium">
                  <span className="truncate">{u.nickname ?? '(닉네임 없음)'}</span>
                  {u.isAdmin && <Badge>관리자</Badge>}
                  {u.isBanned && <Badge variant="destructive">광장 차단됨</Badge>}
                </p>
                <p className="truncate text-sm text-muted-foreground">{u.email}</p>
                <p className="text-xs text-muted-foreground">
                  가입 {formatDate(u.createdAt)} · 최근 접속 {formatDate(u.lastSignInAt)} · 작품{' '}
                  {u.projectCount}개
                </p>
                {u.isAdmin && !(adminCount === 1 && u.isAdmin) && u.id !== callerId && (
                  <p className="text-xs text-muted-foreground">
                    관리자는 해제한 뒤에 삭제할 수 있어요
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!u.isAdmin && <BanButton userId={u.id} isBanned={u.isBanned} />}
                <RoleButton
                  userId={u.id}
                  isAdmin={u.isAdmin}
                  isLastAdmin={u.isAdmin && adminCount === 1}
                />
                {u.id !== callerId && !u.isAdmin && (
                  <DeleteUserButton userId={u.id} email={u.email} />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
