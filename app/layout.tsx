import type { Metadata } from "next";
import { Gowun_Dodum } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "오늘의 뜨개 — 뜨개질 단수 카운터",
  description: "뜨개질 작품별 단수 카운터와 진행률을 기록하는 뜨개인 전용 트래커",
};

// Soft rounded Korean face to match the handmade mood (single 400 weight)
const gowunDodum = Gowun_Dodum({
  weight: "400",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${gowunDodum.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
