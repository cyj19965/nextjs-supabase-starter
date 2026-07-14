import { AuthButton } from '@/components/auth-button';
import Link from 'next/link';
import { Suspense } from 'react';

/** One nav for every page so the banner never shifts between menus. */
export function SiteNav() {
  return (
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
  );
}
