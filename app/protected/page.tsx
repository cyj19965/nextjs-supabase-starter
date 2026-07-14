import { redirect } from 'next/navigation';

// Legacy template route (old auth redirect target) — the app lives at /projects
export default function ProtectedPage() {
  redirect('/projects');
}
