'use client';

import { useEffect, useState } from 'react';

interface ZoomablePhotoProps {
  src: string;
  alt: string;
  projectName: string;
  rowsAt: number | null;
  nickname: string | null;
  caption: string | null;
  createdAt: string;
  thumbClassName?: string;
}

export function ZoomablePhoto({
  src,
  alt,
  projectName,
  rowsAt,
  nickname,
  caption,
  createdAt,
  thumbClassName = 'w-full object-cover',
}: ZoomablePhotoProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    // Prevent background scroll while the lightbox is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block h-full w-full cursor-zoom-in"
        aria-label="사진 크게 보기"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={thumbClassName} loading="lazy" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 text-3xl leading-none text-white/80 hover:text-white"
            aria-label="닫기"
          >
            ×
          </button>
          <figure
            className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden rounded-2xl bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="max-h-[75vh] w-full object-contain" />
            <figcaption className="space-y-1 p-4">
              {caption && <p className="text-sm">{caption}</p>}
              <p className="text-sm font-medium">
                {projectName}
                {rowsAt !== null && <span className="text-primary"> · 🧶 {rowsAt}단</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                {nickname ? `${nickname} · ` : ''}
                {createdAt.slice(0, 10)}
              </p>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
