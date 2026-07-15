import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DeletePostButton } from '@/components/delete-post-button';
import { getCommunityPosts } from '@/lib/community';
import { photoUrl } from '@/lib/projects';
import { createClient } from '@/lib/supabase/server';

// cacheComponents mode: uncached (auth-scoped) data must render inside Suspense
export default function CommunityPage() {
  return (
    <Suspense>
      <CommunityContent />
    </Suspense>
  );
}

async function CommunityContent() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect('/auth/login');
  const myId = data.claims.sub as string;

  const posts = await getCommunityPosts();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">🧺 뜨개 광장</h1>
        <p className="text-sm text-muted-foreground">
          회원들이 나눠준 뜨개 순간들 — 작품 상세의 사진 기록에서 공유할 수 있어요.
        </p>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            아직 공유된 기록이 없어요. 첫 번째로 자랑해보세요! 🧶
          </CardContent>
        </Card>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
          {posts.map((post) => (
            <figure
              key={post.id}
              className="break-inside-avoid overflow-hidden rounded-2xl border border-black/5 bg-card shadow-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl(post.photo_path)}
                alt={post.caption ?? `${post.project_name} 사진`}
                className="w-full object-cover"
                loading="lazy"
              />
              <figcaption className="space-y-1 p-3">
                {post.caption && <p className="text-sm leading-snug">{post.caption}</p>}
                <p className="text-xs font-medium">
                  {post.project_name}
                  {post.rows_at !== null && (
                    <span className="text-primary"> · 🧶 {post.rows_at}단</span>
                  )}
                </p>
                <p className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {post.nickname ?? '어느 뜨개인'} · {post.created_at.slice(0, 10)}
                  </span>
                  {post.user_id === myId && <DeletePostButton postId={post.id} />}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
