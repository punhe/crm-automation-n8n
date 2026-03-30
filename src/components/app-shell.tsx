"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlarmClockCheck,
  LayoutDashboard,
  Mail,
  ReceiptText,
  Users,
} from "lucide-react";

import { cn } from "@/lib/format";

const navigation = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/invoices", label: "Invoices", icon: ReceiptText },
  { href: "/recovery", label: "Recovery", icon: AlarmClockCheck },
];

type AppShellProps = {
  children: React.ReactNode;
  mode: "live" | "demo";
  mailReady: boolean;
};

export function AppShell({ children, mode, mailReady }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[color:var(--foreground)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 p-4 lg:flex-row lg:p-6">
        <aside className="panel relative overflow-hidden p-5 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[320px] lg:p-7">
          <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_right,_rgba(13,106,110,0.25),_transparent_60%)]" />
          <div className="relative">
            <p className="eyebrow">RepairShopr CRM</p>
            <h1 className="mt-3 max-w-[13ch] text-3xl font-semibold leading-tight tracking-tight">
              Revenue and relationship control room.
            </h1>
            <p className="mt-4 max-w-[28ch] text-sm leading-7 text-[color:var(--muted)]">
              Track customers, watch invoice risk, and handle billing follow-ups without leaving one calm workspace.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex rounded-full bg-[rgba(13,106,110,0.14)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                {mode === "live" ? "Live connection" : "Demo mode"}
              </span>
              <span className="inline-flex rounded-full bg-[rgba(202,114,66,0.14)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-2)]">
                {mailReady ? "Mail ready" : "Mail setup needed"}
              </span>
            </div>
          </div>

          <nav className="relative mt-8 grid gap-2">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border px-4 py-3 transition",
                    active
                      ? "border-[rgba(13,106,110,0.22)] bg-[rgba(13,106,110,0.1)] text-[var(--foreground)]"
                      : "border-transparent bg-white/55 text-[color:var(--muted)] hover:border-[color:var(--border)] hover:bg-white/80 hover:text-[color:var(--foreground)]",
                  )}
                >
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  <span className="text-xs uppercase tracking-[0.2em]">
                    {active ? "Here" : "Open"}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="relative mt-8 rounded-[28px] border border-[rgba(31,42,38,0.08)] bg-[var(--panel-strong)] p-4">
            <div className="flex items-center gap-3 text-[var(--accent)]">
              <Mail className="h-5 w-5" />
              <p className="text-sm font-semibold">Email-first workflow</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              This build intentionally avoids Slack. All follow-up actions stay inside RepairShopr and your mail stack.
            </p>
          </div>
        </aside>

        <main className="flex-1">
          <div className="mx-auto flex min-h-full max-w-[1120px] flex-col gap-6 pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
