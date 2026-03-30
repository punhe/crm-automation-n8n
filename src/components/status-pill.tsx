import { cn } from "@/lib/format";

type StatusPillProps = {
  label: string;
  tone?: "teal" | "amber" | "orange" | "rose" | "berry" | "sage" | "slate";
};

const tones: Record<NonNullable<StatusPillProps["tone"]>, string> = {
  teal: "bg-[rgba(13,106,110,0.12)] text-[var(--accent)]",
  amber: "bg-[rgba(214,153,64,0.18)] text-[#9a5a00]",
  orange: "bg-[rgba(202,114,66,0.18)] text-[var(--accent-2)]",
  rose: "bg-[rgba(183,81,97,0.14)] text-[#8b2f4b]",
  berry: "bg-[rgba(116,46,74,0.16)] text-[#742e4a]",
  sage: "bg-[rgba(79,109,88,0.14)] text-[#2f5e46]",
  slate: "bg-[rgba(84,95,106,0.14)] text-[#465360]",
};

export function StatusPill({ label, tone = "sage" }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        tones[tone],
      )}
    >
      {label}
    </span>
  );
}
