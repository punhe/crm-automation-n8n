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
      <section className="panel p-6 sm:p-8">
        <p className="eyebrow">Customers</p>
        <h2 className="section-title mt-4 max-w-[14ch]">
          Search the people and accounts behind your cashflow.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
          This directory is intentionally simple: search by name, business or
          email, then jump from contact context into invoice and billing follow-up.
        </p>
      </section>

      <FlashBanner flash={params.flash} />

      <section className="panel p-6">
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
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            Search customers
          </button>
        </form>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {customers.items.map((customer) => (
            <article key={customer.id} className="surface-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-semibold">
                    {customer.business_name || customer.fullname}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">
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

              <dl className="mt-5 grid gap-3 text-sm text-[color:var(--muted)]">
                <div>
                  <dt className="eyebrow">Email</dt>
                  <dd className="mt-1 text-[color:var(--foreground)]">
                    {customer.email || "Missing"}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Phone</dt>
                  <dd className="mt-1 text-[color:var(--foreground)]">
                    {customer.mobile || customer.phone || "Missing"}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Last Updated</dt>
                  <dd className="mt-1 text-[color:var(--foreground)]">
                    {toRelativeTime(customer.updated_at)}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>

        {customers.items.length === 0 ? (
          <div className="surface-card mt-6 p-6">
            <p className="text-lg font-semibold">No customers matched that query.</p>
            <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
              Try a looser search term or remove filters to inspect the full directory.
            </p>
          </div>
        ) : null}
      </section>
    </>
  );
}
