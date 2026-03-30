"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/lib/format";

type ActionButtonProps = {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost";
};

export function ActionButton({
  label,
  pendingLabel = "Working...",
  variant = "primary",
}: ActionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55",
        variant === "primary" &&
          "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]",
        variant === "secondary" &&
          "border border-[color:var(--border)] bg-white/75 text-[color:var(--foreground)] hover:bg-white",
        variant === "ghost" &&
          "text-[color:var(--muted)] hover:bg-white/60 hover:text-[color:var(--foreground)]",
      )}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
