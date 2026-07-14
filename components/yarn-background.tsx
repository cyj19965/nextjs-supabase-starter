/** Fixed decorative backdrop: soft warm blobs + faint yarn doodles. */
export function YarnBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-28 top-1/3 h-96 w-96 rounded-full bg-accent/70 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 h-80 w-80 rounded-full bg-secondary blur-3xl" />
      <p className="absolute left-[6%] top-[18%] -rotate-12 text-8xl opacity-[0.06] select-none">
        🧶
      </p>
      <p className="absolute right-[8%] top-[12%] rotate-12 text-7xl opacity-[0.06] select-none">
        🧣
      </p>
      <p className="absolute bottom-[14%] right-[16%] -rotate-6 text-8xl opacity-[0.05] select-none">
        🧤
      </p>
      <p className="absolute bottom-[8%] left-[10%] rotate-6 text-6xl opacity-[0.05] select-none">
        🪡
      </p>
    </div>
  );
}
