import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusPill } from "@/components/status-pill";
import { toCurrency, toDateLabel, toRelativeTime } from "@/lib/format";
import { getCustomerById, getCustomerInvoices } from "@/lib/repairshopr";

type CustomerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = await params;
  const customerId = Number(id);

  if (Number.isNaN(customerId)) {
    notFound();
  }

  const [customer, invoices] = await Promise.all([
    getCustomerById(customerId),
    getCustomerInvoices(customerId),
  ]);

  if (!customer) {
    notFound();
  }

  const segment =
    typeof customer.properties?.lifecycle_segment === "string"
      ? customer.properties.lifecycle_segment
      : customer.no_email
        ? "No email"
        : "Active";

  const unpaidInvoices = invoices.filter((inv) => !inv.is_paid);
  const paidInvoices = invoices.filter((inv) => inv.is_paid);
  const totalOutstanding = unpaidInvoices.reduce(
    (sum, inv) => sum + Number.parseFloat(inv.total || "0"),
    0,
  );

  return (
    <>
      {/* Header */}
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Customer Profile</p>
            <h2 className="section-title mt-3">
              {customer.business_name || customer.fullname}
            </h2>
            {customer.business_name ? (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Contact: {customer.fullname}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <StatusPill label={segment} tone={customer.no_email ? "slate" : "teal"} />
            <Link
              href="/customers"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel-soft)]"
            >
              ← Back to List
            </Link>
          </div>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="surface-card p-4">
          <p className="eyebrow">Email</p>
          <p className="mt-2 text-base font-semibold text-[var(--foreground)] break-all">
            {customer.email || "Not provided"}
          </p>
        </article>

        <article className="surface-card p-4">
          <p className="eyebrow">Phone</p>
          <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
            {customer.phone || "Not provided"}
          </p>
          {customer.mobile ? (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Mobile: {customer.mobile}
            </p>
          ) : null}
        </article>

        <article className="surface-card p-4">
          <p className="eyebrow">Outstanding</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {toCurrency(totalOutstanding)}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length !== 1 ? "s" : ""}
          </p>
        </article>

        <article className="surface-card p-4">
          <p className="eyebrow">Last Updated</p>
          <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
            {toRelativeTime(customer.updated_at)}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Created {toRelativeTime(customer.created_at)}
          </p>
        </article>
      </section>

      {/* Additional contacts */}
      {customer.contacts && customer.contacts.length > 0 ? (
        <section className="panel p-5">
          <p className="eyebrow">Contacts on file</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {customer.contacts.map((contact, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-md bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-medium text-[var(--accent)]"
              >
                {contact.email || "No email"}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* Properties */}
      {customer.properties && Object.keys(customer.properties).length > 0 ? (
        <section className="panel p-5">
          <p className="eyebrow">Custom properties</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(customer.properties).map(([key, value]) => (
              <div key={key} className="surface-card p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                  {key.replace(/_/g, " ")}
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                  {String(value ?? "—")}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Invoices */}
      <section className="panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Invoices</p>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-[var(--foreground)]">
              {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} on record
            </h3>
          </div>
          <div className="flex gap-2">
            <StatusPill label={`${unpaidInvoices.length} unpaid`} tone="rose" />
            <StatusPill label={`${paidInvoices.length} paid`} tone="teal" />
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="surface-card mt-5 p-5">
            <p className="text-sm leading-6 text-[var(--muted)]">
              No invoices found for this customer.
            </p>
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-lg">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <p className="font-semibold text-[var(--foreground)]">
                        {invoice.number}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        ID {invoice.id}
                      </p>
                    </td>
                    <td>
                      <p className="text-sm text-[var(--foreground)]">
                        {toDateLabel(invoice.date)}
                      </p>
                    </td>
                    <td>
                      <p className="text-sm text-[var(--foreground)]">
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
                        label={invoice.is_paid ? "Paid" : "Unpaid"}
                        tone={invoice.is_paid ? "teal" : "rose"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
