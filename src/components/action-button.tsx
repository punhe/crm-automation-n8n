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
        "inline-flex min-h-9 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55",
        variant === "primary" &&
          "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)]",
        variant === "secondary" &&
          "border border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] hover:bg-[var(--panel-soft)]",
        variant === "ghost" &&
          "bg-transparent text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)]",
      )}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
