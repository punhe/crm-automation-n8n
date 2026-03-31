"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlarmClockCheck,
  Bell,
  Grid3X3,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquare,
  Plus,
  ReceiptText,
  Search,
  Settings,
  Users,
  Workflow,
} from "lucide-react";

import { cn } from "@/lib/format";

const navigation = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/invoices", label: "Invoices", icon: ReceiptText },
  { href: "/recovery", label: "Recovery", icon: AlarmClockCheck },
  { href: "/workflows", label: "Flows", icon: Workflow },
];

type AppShellProps = {
  children: React.ReactNode;
  mode: "live" | "demo";
  mailReady: boolean;
};

export function AppShell({ children, mode, mailReady }: AppShellProps) {
  const pathname = usePathname();
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
      {/* ── Icon sidebar (Figma Navigation Web / Icons) ── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[64px] flex-col items-center bg-white py-5 lg:flex">
        {/* Logo */}
        <div className="mb-6 flex h-9 w-9 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--accent),#7b8aff)] text-sm font-bold text-white">
          C
        </div>

        {/* Top navigation icons */}
        <nav className="flex flex-1 flex-col items-center gap-1">
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
                className={cn("nav-icon-btn", active && "active")}
              >
                <Icon className="h-[20px] w-[20px]" />
              </Link>
            );
          })}

          <div className="my-3 h-px w-6 bg-[var(--border)]" />

          {/* Extra icon slots */}
          <div className="nav-icon-btn relative">
            <Bell className="h-[20px] w-[20px]" />
            <span className="badge-dot badge-dot-pink" />
          </div>
          <div className="nav-icon-btn relative">
            <MessageSquare className="h-[20px] w-[20px]" />
            <span className="badge-dot badge-dot-blue" />
          </div>
          <div className="nav-icon-btn">
            <Mail className="h-[20px] w-[20px]" />
          </div>
          <div className="nav-icon-btn">
            <Search className="h-[20px] w-[20px]" />
          </div>
        </nav>

        {/* Bottom icons */}
        <div className="flex flex-col items-center gap-1">
          <div className="nav-icon-btn">
            <Settings className="h-[20px] w-[20px]" />
          </div>

          {/* User avatar */}
          <div className="mt-3 relative">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-8 w-8 rounded-[5px]",
                },
              }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--accent-mint)]" />
          </div>
        </div>

        {/* Right edge separator */}
        <div className="absolute right-0 top-0 h-full w-px bg-[var(--border)]" />
      </aside>

      {/* ── Main content area ── */}
      <div className="flex flex-1 flex-col lg:ml-[64px]">
        {/* ── Top bar (Figma Navigation Web / Top Bar) ── */}
        <header className="sticky top-0 z-30 flex h-[56px] items-center justify-between bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button className="topbar-btn lg:hidden">
              <Menu className="h-4 w-4" />
            </button>

            <div className="topbar-btn hidden lg:flex">
              <Menu className="h-4 w-4" />
            </div>
            <div className="topbar-btn hidden lg:flex">
              <Plus className="h-4 w-4" />
            </div>
            <div className="topbar-btn hidden lg:flex">
              <Grid3X3 className="h-4 w-4" />
            </div>

            <h1 className="ml-2 text-lg font-semibold tracking-tight text-[var(--foreground)]">
              {currentSection === "Overview" ? "Dashboard" : currentSection}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Status badges */}
            <span className="hidden items-center gap-1.5 rounded-md bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)] sm:inline-flex">
              {mode === "live" ? "Live" : "Demo"}
            </span>
            <span className="hidden items-center gap-1.5 rounded-md bg-[rgba(124,231,172,0.14)] px-2.5 py-1 text-xs font-medium text-[#2DB77B] sm:inline-flex">
              {mailReady ? "Mail ✓" : "Mail ✗"}
            </span>

            {/* User button (desktop) */}
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

          {/* Bottom border */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-[var(--border)]" />
        </header>

        {/* ── Mobile bottom nav ── */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-[var(--border)] bg-white lg:hidden">
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

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto px-4 py-5 pb-20 lg:px-6 lg:pb-6">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
