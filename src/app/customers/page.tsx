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
          This directory is intentionally simple: search by name, business or
          email, then jump from contact context into invoice and billing follow-up.
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
            className="inline-flex min-h-9 items-center justify-center rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            Search customers
          </button>
        </form>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {customers.items.map((customer) => (
            <article key={customer.id} className="surface-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[var(--foreground)]">
                    {customer.business_name || customer.fullname}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--muted)]">
                    {customer.fullname}
                  </p>
                </div>
                <StatusPill
                  label={
                    typeof customer.properties?.lifecycle_segment === "string"
                      ? customer.properties.lifecycle_segment
                      : customer.no_email
                        ? "No email"
                        : "Active"
                  }
                  tone={customer.no_email ? "slate" : "teal"}
                />
              </div>

              <dl className="mt-4 grid gap-2.5 text-sm text-[var(--muted)]">
                <div>
                  <dt className="eyebrow">Email</dt>
                  <dd className="mt-0.5 text-[var(--foreground)]">
                    {customer.email || "Missing"}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Phone</dt>
                  <dd className="mt-0.5 text-[var(--foreground)]">
                    {customer.mobile || customer.phone || "Missing"}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Last Updated</dt>
                  <dd className="mt-0.5 text-[var(--foreground)]">
                    {toRelativeTime(customer.updated_at)}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        {customers.items.length === 0 ? (
          <div className="surface-card mt-5 p-5">
            <p className="text-base font-semibold text-[var(--foreground)]">No customers matched that query.</p>
            <p className="mt-1.5 text-sm leading-7 text-[var(--muted)]">
              Try a looser search term or remove filters to inspect the full directory.
            </p>
          </div>
        ) : null}
      </section>
    </>
  );
}
