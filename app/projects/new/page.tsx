import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PROJECT_KINDS } from '@/lib/projects';
import { createClient } from '@/lib/supabase/server';
import { createProject } from '../actions';
import { Suspense } from 'react';

// cacheComponents mode: uncached (auth-scoped) data must render inside Suspense
export default function NewProjectPage() {
  return (
    <Suspense>
      <NewProjectContent />
    </Suspense>
  );
}

async function NewProjectContent() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect('/auth/login');

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 p-5">
      <Link href="/projects" className="text-sm text-muted-foreground hover:underline">
        ← 목록으로
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>🌱 새 작품 시작</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createProject} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">작품 이름 (필수)</Label>
              <Input id="name" name="name" required maxLength={100} placeholder="예: 엄마 목도리" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="kind">종류</Label>
                <select
                  id="kind"
                  name="kind"
                  defaultValue=""
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">선택 안 함</option>
                  {PROJECT_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal_rows">목표 단수</Label>
                <Input id="goal_rows" name="goal_rows" type="number" min={1} placeholder="예: 240" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="yarn">실</Label>
                <Input id="yarn" name="yarn" maxLength={200} placeholder="예: 램스울 3볼" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="needle">바늘</Label>
                <Input id="needle" name="needle" maxLength={200} placeholder="예: 대바늘 4.5mm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="started_at">시작일</Label>
              <Input id="started_at" name="started_at" type="date" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="memo">패턴 메모</Label>
              <textarea
                id="memo"
                name="memo"
                maxLength={200}
                rows={3}
                placeholder="예: 40코 잡고 2단마다 양끝 1코 줄임"
                className="w-full rounded-md border border-input bg-transparent p-3 text-sm"
              />
            </div>
            <Button type="submit" className="w-full">
              코 잡기 (등록)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
