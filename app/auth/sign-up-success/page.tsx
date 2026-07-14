import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Link href="/" className="text-center font-semibold">
            🧶 오늘의 뜨개
          </Link>
          <Card>
            <CardHeader className="text-center">
              <p className="text-4xl" aria-hidden>
                💌
              </p>
              <CardTitle className="text-2xl">가입해주셔서 고마워요!</CardTitle>
              <CardDescription>메일함을 확인해주세요</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                보내드린 확인 메일의 링크를 누르면 가입이 완료되고, 바로 첫
                작품의 코를 잡을 수 있어요. 메일이 안 보이면 스팸함도
                확인해주세요.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
