import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  const nickname = (user?.user_metadata as { nickname?: string } | undefined)?.nickname;

  return user ? (
    <div className="flex min-w-0 items-center gap-3">
      {/* Greeting stays compact and hides on phones so the logo never wraps */}
      <span className="hidden max-w-48 truncate text-sm text-muted-foreground sm:inline">
        {nickname ? `${nickname}님 🧶` : user.email}
      </span>
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
