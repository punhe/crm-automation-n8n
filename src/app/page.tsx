import Link from "next/link";
import {
  AlarmClockCheck,
  ArrowUpRight,
  CircleDollarSign,
  Sparkles,
  Users2,
} from "lucide-react";

import { FlashBanner } from "@/components/flash-banner";
import { MetricCard } from "@/components/metric-card";
import { StatusPill } from "@/components/status-pill";
import { toCurrency, toDateLabel, toNumber, toRelativeTime } from "@/lib/format";
import { getRecoveryBuckets, getStageLabel, getStageTone } from "@/lib/reminders";
import { getDashboardSnapshot, getInvoiceList } from "@/lib/repairshopr";

type HomePageProps = {
  searchParams: Promise<{ flash?: string | string[] }>;
};

function buildChart(values: number[], width: number, height: number, padding = 18) {
  const safeValues = values.length > 0 ? values : [1, 3, 2, 4, 3, 5];
  const max = Math.max(...safeValues, 1);
  const step = safeValues.length > 1 ? (width - padding * 2) / (safeValues.length - 1) : 0;

  const points = safeValues.map((value, index) => ({
    x: padding + index * step,
    y: height - padding - (value / max) * (height - padding * 2),
  }));

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const first = points[0];
  const last = points[points.length - 1];
  const area = `${line} L ${last.x} ${height - padding} L ${first.x} ${height - padding} Z`;

  return { line, area };
}

function RevenueChart({ values }: { values: number[] }) {
  const { line, area } = buildChart(values, 560, 200);

  return (
    <div className="mt-5 rounded-xl bg-[var(--panel-soft)] p-4">
      <div className="relative h-[200px] overflow-hidden rounded-lg bg-[var(--panel)]">
        <svg
          viewBox="0 0 560 200"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="overview-chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(94,129,244,0.20)" />
              <stop offset="100%" stopColor="rgba(94,129,244,0.02)" />
            </linearGradient>
          </defs>
          {Array.from({ length: 4 }).map((_, index) => (
            <line
              key={index}
              x1="18"
              x2="542"
              y1={30 + index * 45}
              y2={30 + index * 45}
              stroke="rgba(129,129,165,0.10)"
              strokeDasharray="4 6"
            />
          ))}
          <path d={area} fill="url(#overview-chart-fill)" />
          <path
            d={line}
            fill="none"
            stroke="var(--accent)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
        </svg>
      </div>
    </div>
  );
}

function QueueRing({
  dueToday,
  overdue,
  watch,
}: {
  dueToday: number;
  overdue: number;
  watch: number;
}) {
  const segments = [
    { value: dueToday, color: "var(--accent)", label: "Due today" },
    { value: overdue, color: "var(--accent-amber)", label: "Overdue" },
    { value: watch, color: "var(--accent-mint)", label: "Watch" },
  ];
  const total = Math.max(dueToday + overdue + watch, 1);

  let cursor = 0;
  const gradient = segments
    .map((segment) => {
      const start = (cursor / total) * 360;
      cursor += segment.value;
      const end = (cursor / total) * 360;
      return `${segment.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="grid gap-4 sm:grid-cols-[130px_1fr] sm:items-center">
      <div
        className="mx-auto h-[120px] w-[120px] rounded-full p-2.5"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[var(--panel)] text-center">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
            Open
          </span>
          <span className="mt-0.5 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {dueToday + overdue + watch}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className="flex items-center justify-between rounded-lg bg-[var(--panel-soft)] px-3.5 py-2.5"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm font-medium text-[var(--foreground)]">
                {segment.label}
              </span>
            </div>
            <span className="text-sm font-bold text-[var(--foreground)]">
              {segment.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const [snapshot, recentInvoices] = await Promise.all([
    getDashboardSnapshot(),
    getInvoiceList({ state: "unpaid", page: 1 }),
  ]);

  const buckets = getRecoveryBuckets(snapshot.recoveryQueue);
  const recentValues = recentInvoices.items
    .slice(0, 6)
    .reverse()
    .map((invoice) => toNumber(invoice.total));
  const latestSignals = snapshot.recoveryQueue
    .slice()
    .sort((left, right) => toNumber(right.total) - toNumber(left.total))
    .slice(0, 3);
  const watchCount = Math.max(
    snapshot.unpaidCount - snapshot.dueTodayCount - snapshot.overdueCount,
    0,
  );

  return (
    <>
      <section className="panel overflow-hidden p-5 sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_340px] xl:items-start">
          <div>
            <p className="eyebrow">Dashboard Overview</p>
            <h2 className="section-title mt-3 max-w-[14ch]">
              Spot revenue drag before it slows the team.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              The current workspace mirrors a clean SaaS dashboard language from
              the Figma kit: bright surface cards, a tighter analytics rhythm and
              one protected place to move from CRM context into billing action.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href="/recovery"
                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
              >
                Open recovery queue
              </Link>
              <Link
                href="/invoices?scope=unpaid"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--panel)] px-5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel-soft)]"
              >
                Review invoices
              </Link>
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-3">
              <div className="surface-card p-4">
                <p className="eyebrow">Latest customer</p>
                <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                  {snapshot.latestCustomer?.business_name ||
                    snapshot.latestCustomer?.fullname ||
                    "Waiting for sync"}
                </p>
                <p className="mt-1.5 text-sm text-[var(--muted)]">
                  Added {toRelativeTime(snapshot.latestCustomer?.created_at)}
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="eyebrow">Coverage</p>
                <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                  {snapshot.invoiceCoverage === "full" ? "Full visibility" : "API-safe view"}
                </p>
                <p className="mt-1.5 text-sm text-[var(--muted)]">
                  {snapshot.invoiceCoverage === "full"
                    ? "All fetched unpaid pages are reflected in this dashboard."
                    : "Totals cap pages to keep RepairShopr requests predictable."}
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="eyebrow">Immediate focus</p>
                <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                  {buckets.overdue7.length + buckets.overdue14.length} firm follow-ups
                </p>
                <p className="mt-1.5 text-sm text-[var(--muted)]">
                  Higher-risk balances are grouped for quick billing action this week.
                </p>
              </div>
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Queue Mix</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]">
                  Current billing pressure
                </h3>
              </div>
              <StatusPill label="Live data" tone="berry" />
            </div>

            <div className="mt-5">
              <QueueRing
                dueToday={snapshot.dueTodayCount}
                overdue={snapshot.overdueCount}
                watch={watchCount}
              />
            </div>

            <div className="soft-divider mt-5 pt-4">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Suggested next move
              </p>
              <p className="mt-1.5 text-sm leading-6 text-[var(--muted)]">
                Clear due-today balances first, then work the 7+ day invoices before
                customer replies begin to stack.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FlashBanner flash={params.flash} />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          eyebrow="Outstanding"
          value={toCurrency(snapshot.outstandingTotal)}
          caption="Total unpaid invoice value currently visible in the console."
          icon={<CircleDollarSign className="h-5 w-5" />}
        />
        <MetricCard
          eyebrow="Overdue"
          value={String(snapshot.overdueCount)}
          caption="Invoices that already need a more direct collections response."
          icon={<AlarmClockCheck className="h-5 w-5" />}
        />
        <MetricCard
          eyebrow="Due Today"
          value={String(snapshot.dueTodayCount)}
          caption="Friendly reminder opportunities before balances slip late."
          icon={<Sparkles className="h-5 w-5" />}
        />
        <MetricCard
          eyebrow="Customers"
          value={String(snapshot.customerCount)}
          caption="Visible customer records connected to your RepairShopr account."
          icon={<Users2 className="h-5 w-5" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_340px]">
        <article className="panel p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Revenue Momentum</p>
              <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]">
                Recent unpaid invoice values
              </h3>
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                Unpaid value
              </span>
              <span className="flex items-center gap-1.5">
                <ArrowUpRight className="h-3.5 w-3.5 text-[var(--accent)]" />
                latest six
              </span>
            </div>
          </div>

          <RevenueChart values={recentValues} />
        </article>

        <article className="panel p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Priority Radar</p>
              <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]">
                What to handle next
              </h3>
            </div>
            <Link
              href="/recovery"
              className="text-sm font-semibold text-[var(--accent)]"
            >
              Open queue
            </Link>
          </div>

          <div className="mt-5 space-y-2.5">
            {[
              { label: "Due today", count: buckets.dueToday.length, tone: "amber" as const },
              { label: "3+ days overdue", count: buckets.overdue3.length, tone: "orange" as const },
              { label: "7+ days overdue", count: buckets.overdue7.length, tone: "rose" as const },
              { label: "14+ days overdue", count: buckets.overdue14.length, tone: "berry" as const },
            ].map((bucket) => (
              <div
                key={bucket.label}
                className="surface-card flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {bucket.label}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    Recovery work available now.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <StatusPill label={bucket.label} tone={bucket.tone} />
                  <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">
                    {bucket.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_340px]">
        <article className="panel p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Latest Unpaid</p>
              <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]">
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

          <div className="mt-5 overflow-hidden rounded-lg">
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
                        <p className="font-semibold text-[var(--foreground)]">
                          {invoice.number}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          Updated {toRelativeTime(invoice.updated_at)}
                        </p>
                      </td>
                      <td>
                        <p className="font-medium text-[var(--foreground)]">
                          {invoice.customer_business_then_name}
                        </p>
                      </td>
                      <td>
                        <p className="font-medium text-[var(--foreground)]">
                          {toDateLabel(invoice.due_date)}
                        </p>
                      </td>
                      <td>
                        <p className="font-semibold text-[var(--foreground)]">
                          {toCurrency(invoice.total)}
                        </p>
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
        </article>

        <aside className="grid gap-4">
          <article className="panel p-5">
            <p className="eyebrow">Collections Focus</p>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]">
              Highest balance signals
            </h3>

            <div className="mt-5 space-y-2.5">
              {latestSignals.length > 0 ? (
                latestSignals.map((invoice) => (
                  <div key={invoice.id} className="surface-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {invoice.number}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {invoice.customer_business_then_name}
                        </p>
                      </div>
                      <StatusPill
                        label={getStageLabel(invoice.status)}
                        tone={getStageTone(invoice.status)}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-[var(--muted)]">Amount</span>
                      <span className="font-bold text-[var(--foreground)]">
                        {toCurrency(invoice.total)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="surface-card p-4">
                  <p className="text-sm text-[var(--muted)]">
                    No live recovery signals yet.
                  </p>
                </div>
              )}
            </div>
          </article>

          <article className="panel p-5">
            <p className="eyebrow">Operating Rhythm</p>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]">
              Daily playbook
            </h3>

            <div className="mt-5 space-y-2.5">
              {[
                "Start with due-today invoices before responses go cold.",
                "Use native resend when speed matters, custom reminder when tone matters.",
                "Fix missing due dates quickly so automation keeps its timeline.",
              ].map((tip, index) => (
                <div key={tip} className="surface-card p-4">
                  <p className="eyebrow">Step 0{index + 1}</p>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--foreground)]">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </>
  );
}
