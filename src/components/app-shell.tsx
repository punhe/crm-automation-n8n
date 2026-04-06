"use client";

import { UserButton } from "@clerk/nextjs";
import {
  AlarmClockCheck,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ReceiptText,
  Shield,
  Users,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/format";

const navigation = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/invoices", label: "Invoices", icon: ReceiptText },
  { href: "/recovery", label: "Recovery", icon: AlarmClockCheck },
  { href: "/workflows", label: "Flows", icon: Workflow },
  { href: "/admin/users", label: "Admin", icon: Shield },
];

type AppShellProps = {
  children: React.ReactNode;
  mode: "live" | "demo";
};

export function AppShell({ children, mode }: AppShellProps) {
  const pathname = usePathname();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const isAuthRoute =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  const currentSection =
    navigation.find((item) =>
      item.href === "/"
        ? pathname === "/"
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.label || "Workspace";

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[color:var(--foreground)]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[color:var(--foreground)]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden overflow-hidden border-r border-[var(--border)] bg-[var(--panel)] py-5 transition-[width] duration-200 ease-out lg:flex flex-col",
          isSidebarExpanded ? "w-[232px]" : "w-[64px]",
        )}
      >
        <div
          className={cn(
            "flex w-full",
            isSidebarExpanded
              ? "items-center justify-between gap-3 px-4"
              : "flex-col items-center gap-3",
          )}
        >
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3",
              isSidebarExpanded ? "min-w-0" : "",
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--accent),#7b8aff)] text-sm font-bold text-white">
              C
            </div>

            <div
              className={cn(
                "min-w-0 overflow-hidden transition-[max-width,opacity] duration-200",
                isSidebarExpanded
                  ? "max-w-[120px] opacity-100"
                  : "max-w-0 opacity-0",
              )}
            >
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                CRM Console
              </p>
              <p className="truncate text-xs text-[var(--muted)]">
                {mode === "live" ? "Live workspace" : "Demo workspace"}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsSidebarExpanded((current) => !current)}
            aria-label={
              isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"
            }
            aria-expanded={isSidebarExpanded}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--muted)] transition-colors hover:bg-[var(--panel-soft)] hover:text-[var(--foreground)]"
          >
            {isSidebarExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav
          className={cn(
            "mt-6 flex flex-1 flex-col gap-1",
            isSidebarExpanded ? "px-3" : "items-center",
          )}
        >
          {navigation.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === href
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={cn(
                  "nav-icon-btn",
                  isSidebarExpanded
                    ? "h-11 w-full justify-start gap-3 px-3"
                    : "h-9 w-9 justify-center",
                  active && "active",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span
                  className={cn(
                    "overflow-hidden whitespace-nowrap text-sm font-medium transition-[max-width,opacity] duration-150",
                    isSidebarExpanded
                      ? "max-w-[120px] opacity-100"
                      : "max-w-0 opacity-0",
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div
          className={cn(
            "mt-4 flex w-full items-center border-t border-[var(--border)] pt-4",
            isSidebarExpanded ? "gap-3 px-4" : "justify-center",
          )}
        >
          <div className="relative shrink-0">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-8 w-8 rounded-[5px]",
                },
              }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--panel)] bg-[var(--accent-mint)]" />
          </div>

          <div
            className={cn(
              "min-w-0 overflow-hidden transition-[max-width,opacity] duration-150",
              isSidebarExpanded ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0",
            )}
          >
            <p className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
              Workspace
            </p>
            <p className="truncate text-sm font-semibold text-[var(--foreground)]">
              {mode === "live" ? "Live mode" : "Demo mode"}
            </p>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "flex flex-1 flex-col transition-[margin] duration-200 ease-out",
          isSidebarExpanded ? "lg:ml-[232px]" : "lg:ml-[64px]",
        )}
      >
        <header className="header-blur sticky top-0 z-30 flex h-[56px] items-center justify-between border-b border-[var(--border)] px-4 lg:px-6">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
              {currentSection === "Overview" ? "Dashboard" : currentSection}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-md bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)] sm:inline-flex">
              {mode === "live" ? "Live" : "Demo"}
            </span>

            <div className="hidden lg:block">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-8 w-8",
                  },
                }}
              />
            </div>
          </div>


        </header>

        <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-[var(--border)] bg-[var(--panel)] backdrop-blur-md lg:hidden">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === href
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 text-xs",
                  active ? "text-[var(--accent)]" : "text-[var(--muted)]",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto px-4 py-5 pb-20 lg:px-6 lg:pb-6">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
