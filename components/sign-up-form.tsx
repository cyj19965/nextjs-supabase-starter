"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { suggestNickname } from "@/lib/nickname";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  // Randomized after mount — prerender may not call Math.random()
  const [nicknameExample, setNicknameExample] = useState("포근한 실타래 27");
  useEffect(() => {
    setNicknameExample(suggestNickname());
  }, []);
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("비밀번호가 서로 달라요.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/projects`,
          data: { nickname: nickname.trim().slice(0, 20) },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "가입에 실패했어요. 잠시 후 다시 시도해주세요.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Link href="/" className="text-center font-semibold">
        🧶 오늘의 뜨개
      </Link>
      <Card>
        <CardHeader className="text-center">
          <p className="text-4xl" aria-hidden>
            🌱
          </p>
          <CardTitle className="text-2xl">뜨개 시작하기</CardTitle>
          <CardDescription>계정을 만들고 첫 코를 잡아보세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder={`예: ${nicknameExample}`}
                  required
                  maxLength={20}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">비밀번호</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">비밀번호 확인</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  minLength={6}
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "계정 만드는 중..." : "가입하기"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              이미 계정이 있나요?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary underline underline-offset-4"
              >
                로그인
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
