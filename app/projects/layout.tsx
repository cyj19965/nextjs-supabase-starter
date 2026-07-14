import { AuthButton } from '@/components/auth-button';
import { NicknameDialog } from '@/components/nickname-dialog';
import { YarnBackground } from '@/components/yarn-background';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Suspense } from 'react';

async function NicknamePrompt() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const nickname = (claims?.user_metadata as { nickname?: string } | undefined)?.nickname;
  // Pre-nickname accounts get a one-time prompt; new sign-ups already have one
  if (!claims || nickname) return null;
  return <NicknameDialog />;
}

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <YarnBackground />
      <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10 bg-background/70 backdrop-blur">
        <div className="flex w-full max-w-3xl items-center justify-between p-3 px-5 text-sm">
          <Link href="/" className="shrink-0 whitespace-nowrap font-semibold">
            🧶 오늘의 뜨개
          </Link>
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </nav>
      <div className="w-full flex-1">{children}</div>
      <Suspense>
        <NicknamePrompt />
      </Suspense>
    </main>
  );
}
