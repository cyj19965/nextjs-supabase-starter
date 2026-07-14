import { SiteNav } from '@/components/site-nav';
import { YarnBackground } from '@/components/yarn-background';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <YarnBackground />
      <SiteNav />
      <div className="w-full flex-1">{children}</div>
    </main>
  );
}
