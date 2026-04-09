import { cn } from "@/lib/format";

type StatusPillProps = {
  label: string;
  tone?: "teal" | "amber" | "orange" | "rose" | "berry" | "sage" | "slate";
};

const tones: Record<NonNullable<StatusPillProps["tone"]>, string> = {
  teal: "bg-[var(--tag-green-bg)] text-[var(--tag-green-text)]",
  amber: "bg-[var(--tag-yellow-bg)] text-[var(--tag-yellow-text)]",
  orange: "bg-[rgba(232,143,74,0.16)] text-[#e88f4a]",
  rose: "bg-[rgba(255,107,120,0.16)] text-[#ff6b78]",
  berry: "bg-[var(--accent-soft)] text-[var(--accent)]",
  sage: "bg-[var(--tag-green-bg)] text-[var(--tag-green-text)]",
  slate: "bg-[rgba(137,137,137,0.14)] text-[var(--muted)]",
};

export function StatusPill({ label, tone = "sage" }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold",
        tones[tone],
      )}
    >
      {label}
    </span>
  );
}
