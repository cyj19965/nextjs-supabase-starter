import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BanButton } from '@/components/admin/ban-button';
import { DeleteUserButton } from '@/components/admin/delete-user-button';
import { RoleButton } from '@/components/admin/role-button';
import { getAdminData, requireAdmin } from '@/lib/admin';

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
  const { users, stats } = await getAdminData();
  const adminCount = users.filter((u) => u.isAdmin).length;

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
