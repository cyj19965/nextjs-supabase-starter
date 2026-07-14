import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <Link href="/" className="font-semibold">
              🧶 오늘의 뜨개
            </Link>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center gap-7 max-w-2xl p-8 text-center">
          <p className="text-7xl" aria-hidden>
            🧶
          </p>
          <h1 className="text-4xl font-bold leading-snug">
            지금 몇 단째더라?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            뜨개질 작품마다 단수 카운터와 진행률을 기록하세요.
            <br />
            드라마 보면서 떠도 <span className="font-semibold text-primary">+1 버튼</span>만 누르면 됩니다.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="rounded-full bg-secondary px-4 py-1.5">🧣 작품별 카운터</span>
            <span className="rounded-full bg-secondary px-4 py-1.5">📈 진행률 한눈에</span>
            <span className="rounded-full bg-accent px-4 py-1.5 text-accent-foreground">
              💤 잠든 작품 깨우기
            </span>
          </div>
          <Button asChild size="lg" className="h-12 rounded-full px-8 text-base">
            <Link href="/projects">내 작품 보러가기</Link>
          </Button>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-10">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
