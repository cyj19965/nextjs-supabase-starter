import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DeletePostButton } from '@/components/delete-post-button';
import { LikeButton } from '@/components/like-button';
import { PostComments } from '@/components/post-comments';
import { ReportButton } from '@/components/report-button';
import { ZoomablePhoto } from '@/components/zoomable-photo';
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
export default function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  return (
    <Suspense>
      <CommunityContent searchParams={searchParams} />
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
      <ZoomablePhoto
        src={photoUrl(post.photo_path)}
        alt={post.caption ?? `${post.project_name} 사진`}
        projectName={post.project_name}
        rowsAt={post.rows_at}
        nickname={post.nickname}
        caption={post.caption}
        createdAt={post.created_at}
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
          {post.user_id === myId ? (
            <DeletePostButton postId={post.id} />
          ) : (
            <ReportButton postId={post.id} />
          )}
        </p>
        <PostComments postId={post.id} myId={myId} comments={comments} />
      </figcaption>
    </figure>
  );
}

const TABS = [
  ['all', '전체글'],
  ['popular', '🔥 인기글'],
  ['latest', '✨ 최신글'],
] as const;

const LATEST_DAYS = 7;

async function CommunityContent({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: rawTab } = await searchParams;
  const tab = rawTab === 'popular' || rawTab === 'latest' ? rawTab : 'all';

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
  const latestCutoff = Date.now() - LATEST_DAYS * 86_400_000;

  const shown =
    tab === 'popular'
      ? posts.filter((p) => isPopular(p.id)).sort((a, b) => countOf(b.id) - countOf(a.id))
      : tab === 'latest'
        ? posts.filter((p) => new Date(p.created_at).getTime() >= latestCutoff)
        : posts;

  const emptyMessage =
    tab === 'popular'
      ? `아직 인기글이 없어요. 추천 ${threshold}회를 받으면 여기 올라와요 🔥`
      : tab === 'latest'
        ? `최근 ${LATEST_DAYS}일 안에 공유된 글이 없어요.`
        : '아직 공유된 기록이 없어요. 첫 번째로 자랑해보세요! 🧶';

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">🧺 뜨개 광장</h1>
        <p className="text-sm text-muted-foreground">
          회원들이 나눠준 뜨개 순간들 — 작품 상세의 사진 기록에서 공유할 수 있어요.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2 text-sm">
        {TABS.map(([key, label]) => (
          <Link
            key={key}
            href={key === 'all' ? '/community' : `/community?tab=${key}`}
            className={
              'rounded-full px-3.5 py-1 transition ' +
              (tab === key
                ? 'bg-primary font-semibold text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/70')
            }
          >
            {label}
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {emptyMessage}
          </CardContent>
        </Card>
      ) : (
        <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
          {shown.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              myId={myId}
              comments={commentsByPost.get(post.id) ?? []}
              likeCount={countOf(post.id)}
              liked={likeData.likedByMe.has(post.id)}
              popular={isPopular(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
