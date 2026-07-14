import { NicknameDialog } from '@/components/nickname-dialog';
import { SiteNav } from '@/components/site-nav';
import { YarnBackground } from '@/components/yarn-background';
import { createClient } from '@/lib/supabase/server';
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
      <SiteNav />
      <div className="w-full flex-1">{children}</div>
      <Suspense>
        <NicknamePrompt />
      </Suspense>
    </main>
  );
}
