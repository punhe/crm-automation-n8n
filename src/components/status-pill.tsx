import { cn } from "@/lib/format";

type StatusPillProps = {
  label: string;
  tone?: "teal" | "amber" | "orange" | "rose" | "berry" | "sage" | "slate";
};

const tones: Record<NonNullable<StatusPillProps["tone"]>, string> = {
  teal: "bg-[rgba(124,231,172,0.16)] text-[#2DB77B]",
  amber: "bg-[rgba(244,190,94,0.16)] text-[#C49332]",
  orange: "bg-[rgba(244,166,94,0.16)] text-[#C47832]",
  rose: "bg-[rgba(255,128,139,0.16)] text-[#D94452]",
  berry: "bg-[rgba(94,129,244,0.14)] text-[var(--accent)]",
  sage: "bg-[rgba(124,231,172,0.14)] text-[#2DB77B]",
  slate: "bg-[rgba(129,129,165,0.14)] text-[#6B6B8D]",
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
