'use client';

import confetti from 'canvas-confetti';
import { useEffect } from 'react';

// Theme-matched confetti: terracotta, sage, cream, dusty rose
const COLORS = ['#c96f4f', '#a7c4ae', '#f4e8d7', '#e5989b'];

/**
 * Fires once per goal achievement (tracked in localStorage per project);
 * the flag resets when rows drop back below the goal, so re-reaching it
 * celebrates again.
 */
export function GoalCelebration({ projectId, reached }: { projectId: string; reached: boolean }) {
  useEffect(() => {
    const key = `goal-celebrated:${projectId}`;
    if (!reached) {
      localStorage.removeItem(key);
      return;
    }
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, '1');

    confetti({ particleCount: 100, spread: 75, origin: { y: 0.6 }, colors: COLORS });
    const timers = [
      setTimeout(
        () =>
          confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0 }, colors: COLORS }),
        250,
      ),
      setTimeout(
        () =>
          confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1 }, colors: COLORS }),
        450,
      ),
    ];
    return () => timers.forEach(clearTimeout);
  }, [projectId, reached]);

  if (!reached) return null;
  return (
    <div className="animate-bounce-once rounded-2xl bg-accent p-4 text-center text-accent-foreground">
      <p className="text-lg font-bold">🎉 목표 단수 달성!</p>
      <p className="text-sm">수고했어요 — 작품을 완성으로 옮겨뒀어요.</p>
    </div>
  );
}
