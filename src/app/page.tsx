import Link from "next/link";
import {
  AlarmClockCheck,
  CircleDollarSign,
  Sparkles,
  Users2,
} from "lucide-react";

import { FlashBanner } from "@/components/flash-banner";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { toCurrency, toRelativeTime } from "@/lib/format";
import { getRecoveryBuckets, getStageLabel, getStageTone } from "@/lib/reminders";
import { getDashboardSnapshot, getInvoiceList } from "@/lib/repairshopr";

type HomePageProps = {
  searchParams: Promise<{ flash?: string | string[] }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const [snapshot, recentInvoices] = await Promise.all([
    getDashboardSnapshot(),
    getInvoiceList({ state: "unpaid", page: 1 }),
  ]);
  const buckets = getRecoveryBuckets(snapshot.recoveryQueue);

  return (
    <>
      <section className="panel overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_340px] lg:items-end">
          <div>
            <p className="eyebrow">Overview</p>
            <h2 className="section-title mt-4 max-w-[14ch]">
              Watch cashflow pressure before it turns into churn.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)] sm:text-lg">
              This console blends RepairShopr invoice health with an email-first
              collections playbook. The goal is simple: fewer forgotten follow-ups,
              cleaner customer context, and faster billing recovery.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/recovery"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
              >
                Open recovery queue
              </Link>
              <Link
                href="/customers"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--border)] bg-white/80 px-5 text-sm font-semibold text-[color:var(--foreground)] transition hover:bg-white"
              >
                Browse customers
              </Link>
            </div>
          </div>

          <div className="surface-card p-5">
            <p className="eyebrow">Fresh signal</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-[color:var(--muted)]">Latest customer</p>
                <p className="mt-1 text-xl font-semibold">
                  {snapshot.latestCustomer?.business_name ||
                    snapshot.latestCustomer?.fullname ||
                    "No customer yet"}
                </p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Added {toRelativeTime(snapshot.latestCustomer?.created_at)}
                </p>
              </div>
              <div className="soft-divider pt-4">
                <p className="text-sm text-[color:var(--muted)]">Invoice coverage</p>
                <p className="mt-1 text-sm leading-6 text-[color:var(--foreground)]">
                  {snapshot.invoiceCoverage === "full"
                    ? "Dashboard totals cover all fetched unpaid invoices."
                    : "Dashboard totals use the most recent unpaid invoice pages to stay within API-safe limits."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FlashBanner flash={params.flash} />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          eyebrow="Outstanding"
          value={toCurrency(snapshot.outstandingTotal)}
          caption="Total unpaid invoice value currently visible in the console."
          icon={<CircleDollarSign className="h-5 w-5" />}
        />
        <MetricCard
          eyebrow="Overdue"
          value={String(snapshot.overdueCount)}
          caption="Invoices already past due and needing recovery attention."
          icon={<AlarmClockCheck className="h-5 w-5" />}
        />
        <MetricCard
          eyebrow="Due Today"
          value={String(snapshot.dueTodayCount)}
          caption="Friendly nudge opportunities before a balance slips late."
          icon={<Sparkles className="h-5 w-5" />}
        />
        <MetricCard
          eyebrow="Customers"
          value={String(snapshot.customerCount)}
          caption="Visible customer records connected to your RepairShopr account."
          icon={<Users2 className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <article className="panel p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Recovery Radar</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                Queue by urgency
              </h3>
            </div>
            <Link
              href="/recovery"
              className="text-sm font-semibold text-[var(--accent)]"
            >
              View full queue
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { label: "Due today", count: buckets.dueToday.length, tone: "amber" as const },
              { label: "3+ days", count: buckets.overdue3.length, tone: "orange" as const },
              { label: "7+ days", count: buckets.overdue7.length, tone: "rose" as const },
              { label: "14+ days", count: buckets.overdue14.length, tone: "berry" as const },
            ].map((bucket) => (
              <div key={bucket.label} className="surface-card p-5">
                <StatusPill label={bucket.label} tone={bucket.tone} />
                <p className="mt-4 text-3xl font-semibold">{bucket.count}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  Invoices currently sitting in this collection stage.
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel p-6">
          <p className="eyebrow">Playbook</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">
            Suggested operating rhythm
          </h3>
          <div className="mt-6 space-y-4">
            {[
              "Check Due today and 3+ day buckets every morning before customer replies stack up.",
              "Use RepairShopr resend when you want the platform invoice email; use custom reminder when tone matters.",
              "Fix missing due dates first so the queue stays predictable.",
            ].map((tip, index) => (
              <div key={tip} className="surface-card p-4">
                <p className="eyebrow">Step 0{index + 1}</p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--foreground)]">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Latest Unpaid</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">
              Invoice watchlist
            </h3>
          </div>
          <Link
            href="/invoices?scope=unpaid"
            className="text-sm font-semibold text-[var(--accent)]"
          >
            Open invoices
          </Link>
        </div>

        <div className="mt-6 overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Due</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.items.slice(0, 6).map((invoice) => {
                const recovery = snapshot.recoveryQueue.find((item) => item.id === invoice.id);

                return (
                  <tr key={invoice.id}>
                    <td>
                      <p className="font-semibold">{invoice.number}</p>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">
                        Updated {toRelativeTime(invoice.updated_at)}
                      </p>
                    </td>
                    <td>
                      <p className="font-semibold">{invoice.customer_business_then_name}</p>
                    </td>
                    <td>
                      <p className="font-semibold">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "No due date"}
                      </p>
                    </td>
                    <td>
                      <p className="font-semibold">{toCurrency(invoice.total)}</p>
                    </td>
                    <td>
                      <StatusPill
                        label={getStageLabel(recovery?.status || "watch")}
                        tone={getStageTone(recovery?.status || "watch")}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
