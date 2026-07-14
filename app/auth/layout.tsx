import { YarnBackground } from '@/components/yarn-background';

// Every auth screen (login, sign-up, reset, success) shares the warm backdrop
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <YarnBackground />
      {children}
    </>
  );
}
