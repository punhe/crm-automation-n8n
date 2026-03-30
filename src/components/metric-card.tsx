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
  return (
    <article className="panel p-5">
      <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(13,106,110,0.12)] text-[var(--accent)]">
        {icon}
      </div>
      <p className="eyebrow">{eyebrow}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--foreground)]">
        {value}
      </p>
      <p className="mt-2 max-w-xs text-sm leading-6 text-[color:var(--muted)]">
        {caption}
      </p>
    </article>
  );
}
