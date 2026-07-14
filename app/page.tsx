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
            <Link href="/" className="shrink-0 whitespace-nowrap font-semibold">
              🧶 오늘의 뜨개
            </Link>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </nav>

        <div className="flex w-full max-w-2xl flex-col items-center gap-16 p-8 pt-16 text-center">
          {/* Hero */}
          <section className="flex flex-col items-center gap-6">
            <p className="text-7xl" aria-hidden>
              🧶
            </p>
            <h1 className="text-4xl font-bold leading-snug">지금 몇 단째더라?</h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              뜨개질 작품마다 단수 카운터와 진행률을 기록하세요.
              <br />
              드라마 보면서 떠도{' '}
              <span className="font-semibold text-primary">+1 버튼</span>만 누르면 됩니다.
            </p>
            <Button asChild size="lg" className="h-12 rounded-full px-8 text-base">
              <Link href="/projects">내 작품 보러가기</Link>
            </Button>
          </section>

          {/* Demo preview */}
          <section className="w-full max-w-sm" aria-hidden>
            <div className="rotate-1 space-y-3 rounded-3xl border border-black/5 bg-card p-6 text-center shadow-md">
              <p className="flex items-center justify-between text-sm font-semibold">
                <span>🧣 엄마 목도리</span>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">진행중</span>
              </p>
              <p className="text-5xl font-extrabold tabular-nums text-primary">163</p>
              <p className="text-xs text-muted-foreground">목표 240단</p>
              <div className="mx-auto flex max-w-52 items-center justify-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border text-sm">
                  −1
                </span>
                <span className="flex h-9 items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm">
                  +1단 🧶
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[68%] rounded-full bg-primary" />
              </div>
              <p className="text-xs text-muted-foreground">68%</p>
            </div>
          </section>

          {/* How it works */}
          <section className="w-full space-y-5">
            <h2 className="text-2xl font-bold">이렇게 써요</h2>
            <div className="grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
              {[
                {
                  emoji: '🌱',
                  title: '1. 코를 잡아요',
                  desc: '작품 이름과 목표 단수, 쓰는 실과 바늘을 등록해요.',
                },
                {
                  emoji: '🧶',
                  title: '2. 뜨면서 +1',
                  desc: '한 단 끝날 때마다 큰 버튼 하나만. 단수를 다시 셀 필요가 없어요.',
                },
                {
                  emoji: '🎉',
                  title: '3. 완성을 봐요',
                  desc: '차오르는 진행률이 동기가 되고, 완성작은 기록으로 남아요.',
                },
              ].map((step) => (
                <div
                  key={step.title}
                  className="space-y-2 rounded-2xl border border-black/5 bg-card p-5 shadow-sm"
                >
                  <p className="text-3xl" aria-hidden>
                    {step.emoji}
                  </p>
                  <h3 className="font-bold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="rounded-full bg-secondary px-4 py-1.5">🧣 작품별 카운터</span>
            <span className="rounded-full bg-secondary px-4 py-1.5">📈 진행률 한눈에</span>
            <span className="rounded-full bg-accent px-4 py-1.5 text-accent-foreground">
              💤 잠든 작품 깨우기
            </span>
            <span className="rounded-full bg-secondary px-4 py-1.5">📝 패턴 메모</span>
            <span className="rounded-full bg-accent px-4 py-1.5 text-accent-foreground">
              🔒 내 기록은 나만
            </span>
          </section>

          {/* Closing CTA */}
          <section className="w-full space-y-4 rounded-3xl bg-secondary/60 p-8">
            <h2 className="text-xl font-bold">서랍 속에 잠든 작품이 있다면</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              몇 단까지 떴는지 기억이 안 나서 미뤄둔 그 목도리,
              <br />
              오늘 다시 꺼내서 이어 떠보세요.
            </p>
            <Button asChild size="lg" className="h-12 rounded-full px-8">
              <Link href="/auth/sign-up">무료로 시작하기</Link>
            </Button>
          </section>
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
