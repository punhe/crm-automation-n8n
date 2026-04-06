export type Customer = {
  id: number;
  firstname: string | null;
  lastname: string | null;
  fullname: string;
  business_name: string | null;
  business_then_name?: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  created_at: string;
  updated_at: string;
  no_email?: boolean;
  properties?: Record<string, unknown>;
  contacts?: Array<{ email?: string | null }>;
};

export type Invoice = {
  id: number;
  customer_id: number;
  customer_business_then_name: string;
  number: string;
  created_at: string;
  updated_at: string;
  date: string;
  due_date: string | null;
  total: string;
  subtotal?: string;
  tax?: string;
  pdf_url: string | null;
  is_paid: boolean;
  verified_paid?: boolean;
  note?: string | null;
  customer?: Customer;
};

export type RecoveryStatus =
  | "due-today"
  | "overdue-3"
  | "overdue-7"
  | "overdue-14"
  | "watch"
  | "paid"
  | "missing-due-date";

export type RecoveryInvoice = Invoice & {
  daysOverdue: number | null;
  status: RecoveryStatus;
  recipientEmail: string | null;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  totalPages: number;
  totalEntries: number | null;
  perPage: number | null;
};

export type DashboardSnapshot = {
  customerCount: number;
  latestCustomer: Customer | null;
  outstandingTotal: number;
  unpaidCount: number;
  dueTodayCount: number;
  overdueCount: number;
  recoveryQueue: RecoveryInvoice[];
  invoiceCoverage: "full" | "partial";
};
