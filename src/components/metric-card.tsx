import type { ReactNode } from "react";

type MetricCardProps = {
  eyebrow: string;
  value: string;
  caption: string;
  icon: ReactNode;
};

export function MetricCard({
  eyebrow,
  value,
  caption,
  icon,
}: MetricCardProps) {
  /* Deterministic-ish progress width from eyebrow length */
  const progressWidth = 52 + ((eyebrow.length * 9) % 38);

  return (
    <article className="surface-card overflow-hidden p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            {eyebrow}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {value}
          </p>
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
          {icon}
        </div>
      </div>
      <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--muted)]">{caption}</p>
      <div className="mt-4 h-1.5 rounded-full bg-[var(--panel-soft)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
          style={{ width: `${progressWidth}%` }}
        />
      </div>
    </article>
  );
}
