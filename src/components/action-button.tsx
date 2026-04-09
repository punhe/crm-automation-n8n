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
        "inline-flex min-h-9 items-center justify-center px-8 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-55",
        variant === "primary" &&
          "rounded-full bg-[var(--btn-primary-bg)] border border-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-sm hover:brightness-110 focus-visible:shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
        variant === "secondary" &&
          "rounded-full bg-[var(--btn-primary-bg)] border border-[var(--border)] text-[var(--btn-primary-text)] opacity-80 hover:opacity-100 hover:bg-[var(--panel)] hover:text-[var(--foreground)]",
        variant === "ghost" &&
          "rounded-md px-2 bg-transparent text-[var(--muted)] hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)] border border-transparent",
      )}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
