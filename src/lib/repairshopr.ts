import "server-only";

import { getDemoCustomers, getDemoInvoices } from "@/lib/demo-data";
import { getAppConfig, isRepairShoprConfigured } from "@/lib/env";
import { toNumber } from "@/lib/format";
import { toRecoveryInvoice } from "@/lib/reminders";
import type {
  Customer,
  DashboardSnapshot,
  Invoice,
  PaginatedResult,
  RecoveryInvoice,
} from "@/lib/types";

type InvoiceState = "unpaid" | "paid";

type Meta = {
  total_pages?: number;
  total_entries?: number;
  page?: number;
  per_page?: number;
};

function buildApiUrl(pathname: string, params?: Record<string, string | number | boolean>) {
  const config = getAppConfig();
  if (!config.repairshoprSubdomain || !config.repairshoprApiKey) {
    throw new Error("RepairShopr is not configured.");
  }

  const url = new URL(
    `https://${config.repairshoprSubdomain}.repairshopr.com/api/v1${pathname}`,
  );

  url.searchParams.set("api_key", config.repairshoprApiKey);

  Object.entries(params || {}).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

async function repairshoprRequest<T>(
  pathname: string,
  init?: RequestInit,
  params?: Record<string, string | number | boolean>,
) {
  const response = await fetch(buildApiUrl(pathname, params), {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `RepairShopr request failed (${response.status} ${response.statusText}): ${message}`,
    );
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

function paginateDemo<T>(
  items: T[],
  page: number,
  perPage: number,
): PaginatedResult<T> {
  const offset = (page - 1) * perPage;
  const sliced = items.slice(offset, offset + perPage);

  return {
    items: sliced,
    page,
    totalPages: Math.max(1, Math.ceil(items.length / perPage)),
    totalEntries: items.length,
    perPage,
  };
}

export function getConnectionMode() {
  return isRepairShoprConfigured() ? "live" : "demo";
}

export async function getCustomers({
  query,
  page = 1,
}: {
  query?: string;
  page?: number;
}): Promise<PaginatedResult<Customer>> {
  if (!isRepairShoprConfigured()) {
    const customers = getDemoCustomers().filter((customer) => {
      if (!query) {
        return true;
      }

      const haystack = [
        customer.fullname,
        customer.business_name,
        customer.email,
        customer.phone,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query.toLowerCase());
    });

    return paginateDemo(customers, page, 25);
  }

  const payload = await repairshoprRequest<{
    customers: Customer[];
    meta?: Meta;
  }>("/customers", undefined, {
    page,
    ...(query ? { query } : {}),
  });

  return {
    items: payload.customers ?? [],
    page: payload.meta?.page ?? page,
    totalPages: payload.meta?.total_pages ?? 1,
    totalEntries: payload.meta?.total_entries ?? null,
    perPage: payload.meta?.per_page ?? null,
  };
}

export async function getLatestCustomer() {
  if (!isRepairShoprConfigured()) {
    return getDemoCustomers()[0] ?? null;
  }

  const payload = await repairshoprRequest<{ customer: Customer }>("/customers/latest");
  return payload.customer ?? null;
}

async function getInvoicesPage({
  state,
  page,
}: {
  state: InvoiceState;
  page: number;
}): Promise<PaginatedResult<Invoice>> {
  if (!isRepairShoprConfigured()) {
    const invoices = getDemoInvoices().filter((invoice) =>
      state === "unpaid" ? !invoice.is_paid : invoice.is_paid,
    );
    return paginateDemo(invoices, page, 25);
  }

  const payload = await repairshoprRequest<{
    invoices: Invoice[];
    meta?: Meta;
  }>("/invoices", undefined, {
    page,
    [state]: true,
  });

  return {
    items: payload.invoices ?? [],
    page: payload.meta?.page ?? page,
    totalPages: payload.meta?.total_pages ?? 1,
    totalEntries: payload.meta?.total_entries ?? null,
    perPage: payload.meta?.per_page ?? null,
  };
}

export async function getInvoiceList({
  state = "unpaid",
  page = 1,
}: {
  state?: InvoiceState;
  page?: number;
}) {
  return getInvoicesPage({ state, page });
}

export async function getInvoiceById(invoiceId: number) {
  if (!isRepairShoprConfigured()) {
    return getDemoInvoices().find((invoice) => invoice.id === invoiceId) ?? null;
  }

  const payload = await repairshoprRequest<{ invoice: Invoice }>(`/invoices/${invoiceId}`);
  return payload.invoice ?? null;
}

export async function resendInvoiceEmail(invoiceId: number) {
  if (!isRepairShoprConfigured()) {
    return { success: true, mode: "demo" as const };
  }

  await repairshoprRequest(`/invoices/${invoiceId}/email`, {
    method: "POST",
  });

  return { success: true, mode: "live" as const };
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const config = getAppConfig();
  const unpaidInvoices: Invoice[] = [];
  let coverage: DashboardSnapshot["invoiceCoverage"] = "full";

  const firstPage = await getInvoicesPage({ state: "unpaid", page: 1 });
  unpaidInvoices.push(...firstPage.items);

  const pagesToFetch = Math.min(firstPage.totalPages, config.maxPages);
  if (firstPage.totalPages > config.maxPages) {
    coverage = "partial";
  }

  for (let page = 2; page <= pagesToFetch; page += 1) {
    const current = await getInvoicesPage({ state: "unpaid", page });
    unpaidInvoices.push(...current.items);
  }

  const customerPage = await getCustomers({ page: 1 });
  const latestCustomer = await getLatestCustomer();
  const recoveryQueue = unpaidInvoices.map((invoice) => toRecoveryInvoice(invoice));

  return {
    customerCount: customerPage.totalEntries ?? customerPage.items.length,
    latestCustomer,
    outstandingTotal: unpaidInvoices.reduce(
      (sum, invoice) => sum + toNumber(invoice.total),
      0,
    ),
    unpaidCount: unpaidInvoices.length,
    dueTodayCount: recoveryQueue.filter((invoice) => invoice.status === "due-today").length,
    overdueCount: recoveryQueue.filter((invoice) =>
      invoice.status.startsWith("overdue"),
    ).length,
    recoveryQueue,
    invoiceCoverage: coverage,
  };
}

export async function getRecoveryQueue(): Promise<RecoveryInvoice[]> {
  const snapshot = await getDashboardSnapshot();
  return snapshot.recoveryQueue
    .filter((invoice) =>
      ["due-today", "overdue-3", "overdue-7", "overdue-14", "missing-due-date"].includes(
        invoice.status,
      ),
    )
    .sort((left, right) => toNumber(right.total) - toNumber(left.total));
}
