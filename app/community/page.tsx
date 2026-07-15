import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DeletePostButton } from '@/components/delete-post-button';
import { LikeButton } from '@/components/like-button';
import { PostComments } from '@/components/post-comments';
import {
  type CommunityPost,
  type PostComment,
  getCommentsForPosts,
  getCommunityPosts,
  getLikeData,
  getPopularThreshold,
} from '@/lib/community';
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

function PostCard({
  post,
  myId,
  comments,
  likeCount,
  liked,
  popular,
}: {
  post: CommunityPost;
  myId: string;
  comments: PostComment[];
  likeCount: number;
  liked: boolean;
  popular: boolean;
}) {
  return (
    <figure className="break-inside-avoid overflow-hidden rounded-2xl border border-black/5 bg-card shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoUrl(post.photo_path)}
        alt={post.caption ?? `${post.project_name} 사진`}
        className="w-full object-cover"
        loading="lazy"
      />
      <figcaption className="space-y-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            {popular && (
              <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                🔥 인기
              </span>
            )}
            {post.caption && <p className="text-sm leading-snug">{post.caption}</p>}
            <p className="text-xs font-medium">
              {post.project_name}
              {post.rows_at !== null && <span className="text-primary"> · 🧶 {post.rows_at}단</span>}
            </p>
          </div>
          <LikeButton postId={post.id} count={likeCount} liked={liked} />
        </div>
        <p className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {post.nickname ?? '어느 뜨개인'} · {post.created_at.slice(0, 10)}
          </span>
          {post.user_id === myId && <DeletePostButton postId={post.id} />}
        </p>
        <PostComments postId={post.id} myId={myId} comments={comments} />
      </figcaption>
    </figure>
  );
}

async function CommunityContent() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect('/auth/login');
  const myId = data.claims.sub as string;

  const posts = await getCommunityPosts();
  const postIds = posts.map((p) => p.id);
  const [commentsByPost, likeData, threshold] = await Promise.all([
    getCommentsForPosts(postIds),
    getLikeData(postIds, myId),
    getPopularThreshold(),
  ]);

  const countOf = (id: string) => likeData.counts.get(id) ?? 0;
  const isPopular = (id: string) => countOf(id) >= threshold;
  const popularPosts = posts
    .filter((p) => isPopular(p.id))
    .sort((a, b) => countOf(b.id) - countOf(a.id));

  const renderCard = (post: CommunityPost) => (
    <PostCard
      key={post.id}
      post={post}
      myId={myId}
      comments={commentsByPost.get(post.id) ?? []}
      likeCount={countOf(post.id)}
      liked={likeData.likedByMe.has(post.id)}
      popular={isPopular(post.id)}
    />
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">🧺 뜨개 광장</h1>
        <p className="text-sm text-muted-foreground">
          회원들이 나눠준 뜨개 순간들 — 작품 상세의 사진 기록에서 공유할 수 있어요.
        </p>
      </div>

      {popularPosts.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">🔥 인기글</h2>
          <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
            {popularPosts.map(renderCard)}
          </div>
        </section>
      )}

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            아직 공유된 기록이 없어요. 첫 번째로 자랑해보세요! 🧶
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-3">
          {popularPosts.length > 0 && <h2 className="text-lg font-bold">최신글</h2>}
          <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">{posts.map(renderCard)}</div>
        </section>
      )}
    </div>
  );
}
