import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { isAdminClaims } from "@/lib/admin";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  const nickname = (user?.user_metadata as { nickname?: string } | undefined)?.nickname;
  const admin = isAdminClaims(user);

  return user ? (
    <div className="flex min-w-0 items-center gap-3">
      <Link href="/community" className="shrink-0 text-sm font-medium hover:underline">
        🧺 광장
      </Link>
      {admin && (
        <Link
          href="/admin"
          className="shrink-0 text-sm font-medium text-primary hover:underline"
        >
          🛠️ 관리
        </Link>
      )}
      {/* Greeting stays compact and hides on phones so the logo never wraps */}
      <Link
        href="/settings"
        className="hidden max-w-48 truncate text-sm text-muted-foreground hover:underline sm:inline"
        title="계정 설정"
      >
        {nickname ? `${nickname}님 🧶` : user.email}
      </Link>
      <Link
        href="/settings"
        className="text-lg sm:hidden"
        aria-label="계정 설정"
        title="계정 설정"
      >
        ⚙️
      </Link>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex shrink-0 gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">로그인</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">가입하기</Link>
      </Button>
    </div>
  );
}
