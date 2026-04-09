import Link from "next/link";

import { FlashBanner } from "@/components/flash-banner";
import { StatusPill } from "@/components/status-pill";
import { toRelativeTime } from "@/lib/format";
import { getCustomers } from "@/lib/repairshopr";

type CustomersPageProps = {
  searchParams: Promise<{
    query?: string | string[];
    page?: string | string[];
    flash?: string | string[];
  }>;
};

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const params = await searchParams;
  const query = Array.isArray(params.query) ? params.query[0] : params.query;
  const page = Number(Array.isArray(params.page) ? params.page[0] : params.page || "1");
  const customers = await getCustomers({ query, page });

  return (
    <>
      <section className="panel p-5 sm:p-6">
        <p className="eyebrow">Customers</p>
        <h2 className="section-title mt-3 max-w-[14ch]">
          Search the people and accounts behind your cashflow.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
          Click the eye icon on any row to open the full contact profile,
          invoices and lifecycle details.
        </p>
      </section>

      <FlashBanner flash={params.flash} />

      <section className="panel p-5">
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <input
            className="form-input"
            type="search"
            name="query"
            defaultValue={query}
            placeholder="Search by customer, business, email or phone"
          />
          <button
            type="submit"
            className="inline-flex min-h-9 items-center justify-center rounded-full bg-[var(--btn-primary-bg)] border border-[var(--btn-primary-bg)] px-8 text-sm font-semibold text-[var(--btn-primary-text)] transition hover:brightness-110 shadow-sm focus-visible:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
          >
            Search customers
          </button>
        </form>

        {customers.items.length === 0 ? (
          <div className="surface-card mt-5 p-5">
            <p className="text-base font-semibold text-[var(--foreground)]">No customers matched that query.</p>
            <p className="mt-1.5 text-sm leading-7 text-[var(--muted)]">
              Try a looser search term or remove filters to inspect the full directory.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-sm text-[var(--muted)]">
                {customers.totalEntries !== null
                  ? `${customers.totalEntries} total`
                  : `${customers.items.length} results`}
                {" · "}Page {customers.page} of {customers.totalPages}
              </p>
              <StatusPill
                label={`${customers.items.length} shown`}
                tone="berry"
              />
            </div>

            <div className="mt-3 overflow-hidden rounded-lg">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Segment</th>
                    <th>Updated</th>
                    <th style={{ width: 64 }}>View</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.items.map((customer) => {
                    const segment =
                      typeof customer.properties?.lifecycle_segment === "string"
                        ? customer.properties.lifecycle_segment
                        : customer.no_email
                          ? "No email"
                          : "Active";

                    return (
                      <tr key={customer.id}>
                        <td>
                          <p className="font-semibold text-[var(--foreground)]">
                            {customer.business_name || customer.fullname}
                          </p>
                          {customer.business_name ? (
                            <p className="mt-0.5 text-xs text-[var(--muted)]">
                              {customer.fullname}
                            </p>
                          ) : null}
                        </td>
                        <td>
                          <p className="text-sm text-[var(--foreground)]">
                            {customer.email || "—"}
                          </p>
                        </td>
                        <td>
                          <p className="text-sm text-[var(--foreground)]">
                            {customer.mobile || customer.phone || "—"}
                          </p>
                        </td>
                        <td>
                          <StatusPill
                            label={segment}
                            tone={customer.no_email ? "slate" : "teal"}
                          />
                        </td>
                        <td>
                          <p className="text-sm text-[var(--muted)]">
                            {toRelativeTime(customer.updated_at)}
                          </p>
                        </td>
                        <td>
                          <Link
                            href={`/customers/${customer.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--panel)] text-[var(--accent)] transition hover:bg-[var(--accent-soft)]"
                            title={`View ${customer.fullname}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx={12} cy={12} r={3} />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {customers.totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-2">
                {customers.page > 1 ? (
                  <Link
                    href={`/customers?${new URLSearchParams({
                      ...(query ? { query } : {}),
                      page: String(customers.page - 1),
                    }).toString()}`}
                    className="inline-flex min-h-8 items-center rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel-soft)]"
                  >
                    ← Prev
                  </Link>
                ) : null}
                <span className="rounded-md bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent)]">
                  {customers.page} / {customers.totalPages}
                </span>
                {customers.page < customers.totalPages ? (
                  <Link
                    href={`/customers?${new URLSearchParams({
                      ...(query ? { query } : {}),
                      page: String(customers.page + 1),
                    }).toString()}`}
                    className="inline-flex min-h-8 items-center rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--panel-soft)]"
                  >
                    Next →
                  </Link>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}
