import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteAccount } from '@/components/settings/delete-account';
import { NicknameForm } from '@/components/settings/nickname-form';
import { PasswordForm } from '@/components/settings/password-form';
import { createClient } from '@/lib/supabase/server';

// cacheComponents mode: uncached (auth-scoped) data must render inside Suspense
export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect('/auth/login');
  const claims = data.claims;
  const nickname =
    (claims.user_metadata as { nickname?: string } | undefined)?.nickname ?? '';

  return (
    <div className="mx-auto w-full max-w-lg space-y-4 p-5">
      <Link href="/projects" className="text-sm text-muted-foreground hover:underline">
        ← 내 작품으로
      </Link>
      <h1 className="text-2xl font-bold">⚙️ 계정 설정</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">프로필</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <p className="text-xs text-muted-foreground">이메일 (변경 불가)</p>
            <p className="font-medium">{claims.email as string}</p>
          </div>
          <NicknameForm currentNickname={nickname} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">비밀번호 변경</CardTitle>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">위험 구역</CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteAccount />
        </CardContent>
      </Card>
    </div>
  );
}
