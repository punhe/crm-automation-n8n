import { resendInvoiceEmailAction, sendReminderEmailAction } from "@/app/actions";
import { ActionButton } from "@/components/action-button";
import { FlashBanner } from "@/components/flash-banner";
import { StatusPill } from "@/components/status-pill";
import { toCurrency, toDateLabel } from "@/lib/format";
import { getRecoveryBuckets, getStageLabel, getStageTone } from "@/lib/reminders";
import { getRecoveryQueue } from "@/lib/repairshopr";
import type { RecoveryInvoice, ReminderStage } from "@/lib/types";

type RecoveryPageProps = {
  searchParams: Promise<{ flash?: string | string[] }>;
};

function RecoverySection({
  title,
  description,
  invoices,
  returnTo,
  reminderStage,
}: {
  title: string;
  description: string;
  invoices: RecoveryInvoice[];
  returnTo: string;
  reminderStage?: ReminderStage;
}) {
  if (invoices.length === 0) {
    return null;
  }

  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{title}</p>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]">
            {description}
          </h3>
        </div>
        <StatusPill
          label={`${invoices.length} invoices`}
          tone={getStageTone(invoices[0]?.status || "watch")}
        />
      </div>

      <div className="mt-5 grid gap-3">
        {invoices.map((invoice) => (
          <article key={invoice.id} className="surface-card p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="grid gap-3 md:grid-cols-4 md:gap-5">
                <div>
                  <p className="eyebrow">Invoice</p>
                  <p className="mt-1.5 text-base font-semibold text-[var(--foreground)]">{invoice.number}</p>
                </div>
                <div>
                  <p className="eyebrow">Customer</p>
                  <p className="mt-1.5 text-base font-semibold text-[var(--foreground)]">
                    {invoice.customer_business_then_name}
                  </p>
                </div>
                <div>
                  <p className="eyebrow">Due date</p>
                  <p className="mt-1.5 text-base font-semibold text-[var(--foreground)]">
                    {toDateLabel(invoice.due_date)}
                  </p>
                </div>
                <div>
                  <p className="eyebrow">Amount</p>
                  <p className="mt-1.5 text-base font-semibold text-[var(--foreground)]">
                    {toCurrency(invoice.total)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-2.5 xl:items-end">
                <StatusPill
                  label={getStageLabel(invoice.status)}
                  tone={getStageTone(invoice.status)}
                />
                <p className="text-xs text-[var(--muted)]">
                  Recipient: {invoice.recipientEmail || "Resolve from invoice detail"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {reminderStage ? (
                    <form action={sendReminderEmailAction}>
                      <input type="hidden" name="invoiceId" value={invoice.id} />
                      <input type="hidden" name="stage" value={reminderStage} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <ActionButton
                        label="Send reminder"
                        pendingLabel="Sending..."
                      />
                    </form>
                  ) : null}

                  <form action={resendInvoiceEmailAction}>
                    <input type="hidden" name="invoiceId" value={invoice.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <ActionButton
                      label="Resend invoice"
                      pendingLabel="Resending..."
                      variant="secondary"
                    />
                  </form>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default async function RecoveryPage({ searchParams }: RecoveryPageProps) {
  const params = await searchParams;
  const queue = await getRecoveryQueue();
  const buckets = getRecoveryBuckets(queue);
  const returnTo = "/recovery";

  return (
    <>
      <section className="panel p-5 sm:p-6">
        <p className="eyebrow">Recovery</p>
        <h2 className="section-title mt-3 max-w-[14ch]">
          Run billing follow-up from one quiet, email-first queue.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          Each section below represents a reminder moment. Use the custom reminder
          button when you want softer tone control, or resend the native invoice
          email directly from RepairShopr when speed matters more than wording.
        </p>
      </section>

      <FlashBanner flash={params.flash} />

      <RecoverySection
        title="Due today"
        description="Friendly nudge before the balance slips late."
        invoices={buckets.dueToday}
        returnTo={returnTo}
        reminderStage="due-today"
      />
      <RecoverySection
        title="3+ days overdue"
        description="Invoices that need a first firm follow-up."
        invoices={buckets.overdue3}
        returnTo={returnTo}
        reminderStage="overdue-3"
      />
      <RecoverySection
        title="7+ days overdue"
        description="Higher-risk balances that deserve attention this week."
        invoices={buckets.overdue7}
        returnTo={returnTo}
        reminderStage="overdue-7"
      />
      <RecoverySection
        title="14+ days overdue"
        description="Final reminders before you escalate manually."
        invoices={buckets.overdue14}
        returnTo={returnTo}
        reminderStage="overdue-14"
      />
      <RecoverySection
        title="Missing due date"
        description="Fix these invoice records before relying on automation."
        invoices={buckets.missingDueDate}
        returnTo={returnTo}
      />
    </>
  );
}
