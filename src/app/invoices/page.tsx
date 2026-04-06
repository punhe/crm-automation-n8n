import Link from "next/link";

import { resendInvoiceEmailAction } from "@/app/actions";
import { ActionButton } from "@/components/action-button";
import { FlashBanner } from "@/components/flash-banner";
import { StatusPill } from "@/components/status-pill";
import { toCurrency, toDateLabel, toRelativeTime } from "@/lib/format";
import { getStageLabel, getStageTone, toRecoveryInvoice } from "@/lib/reminders";
import { getInvoiceList } from "@/lib/repairshopr";

type InvoicesPageProps = {
  searchParams: Promise<{
    scope?: string | string[];
    page?: string | string[];
    flash?: string | string[];
  }>;
};

export default async function InvoicesPage({
  searchParams,
}: InvoicesPageProps) {
  const params = await searchParams;
  const scope = Array.isArray(params.scope) ? params.scope[0] : params.scope || "unpaid";
  const page = Number(Array.isArray(params.page) ? params.page[0] : params.page || "1");
  const result = await getInvoiceList({
    state: scope === "paid" ? "paid" : "unpaid",
    page,
  });
  const returnTo = `/invoices?scope=${scope}`;

  return (
    <>
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Invoices</p>
            <h2 className="section-title mt-3 max-w-[14ch]">
              Keep billing visible without leaving your CRM seat.
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Unpaid", href: "/invoices?scope=unpaid", active: scope !== "paid" },
              { label: "Paid", href: "/invoices?scope=paid", active: scope === "paid" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex min-h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold transition ${
                  item.active
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--border)] bg-[var(--panel)] text-[var(--foreground)] hover:bg-[var(--panel-soft)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FlashBanner flash={params.flash} />

      <section className="panel p-5">
        <div className="overflow-hidden rounded-lg">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Due</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((invoice) => {
                const recovery = toRecoveryInvoice(invoice);

                return (
                  <tr key={invoice.id}>
                    <td>
                      <p className="font-semibold text-[var(--foreground)]">{invoice.number}</p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        Updated {toRelativeTime(invoice.updated_at)}
                      </p>
                    </td>
                    <td>
                      <p className="font-medium text-[var(--foreground)]">{invoice.customer_business_then_name}</p>
                    </td>
                    <td>
                      <p className="font-medium text-[var(--foreground)]">{toDateLabel(invoice.due_date)}</p>
                    </td>
                    <td>
                      <p className="font-semibold text-[var(--foreground)]">{toCurrency(invoice.total)}</p>
                    </td>
                    <td>
                      <StatusPill
                        label={getStageLabel(recovery.status)}
                        tone={getStageTone(recovery.status)}
                      />
                    </td>
                    <td>
                      <form action={resendInvoiceEmailAction} className="flex">
                        <input type="hidden" name="invoiceId" value={invoice.id} />
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <ActionButton
                          label="Resend invoice"
                          pendingLabel="Resending..."
                          variant="secondary"
                        />
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {result.items.length === 0 ? (
          <div className="surface-card mt-5 p-5">
            <p className="text-base font-semibold text-[var(--foreground)]">No invoices in this view.</p>
            <p className="mt-1.5 text-sm leading-7 text-[var(--muted)]">
              Switch scope or check your RepairShopr filters if you expected invoices here.
            </p>
          </div>
        ) : null}
      </section>
    </>
  );
}
