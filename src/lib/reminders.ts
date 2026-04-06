import { differenceInCalendarDays, parseISO } from "date-fns";

import type {
  Invoice,
  RecoveryInvoice,
  RecoveryStatus,
} from "@/lib/types";

export function getReminderStatus(invoice: Invoice): RecoveryStatus {
  if (invoice.is_paid) {
    return "paid";
  }

  if (!invoice.due_date) {
    return "missing-due-date";
  }

  const daysOverdue = differenceInCalendarDays(new Date(), parseISO(invoice.due_date));

  if (daysOverdue >= 14) {
    return "overdue-14";
  }

  if (daysOverdue >= 7) {
    return "overdue-7";
  }

  if (daysOverdue >= 3) {
    return "overdue-3";
  }

  if (daysOverdue === 0) {
    return "due-today";
  }

  return "watch";
}

export function getDaysOverdue(invoice: Invoice) {
  if (!invoice.due_date) {
    return null;
  }

  return differenceInCalendarDays(new Date(), parseISO(invoice.due_date));
}

export function resolveRecipientEmail(invoice: Invoice) {
  const directEmail = invoice.customer?.email?.trim();
  if (directEmail) {
    return directEmail;
  }

  const contactEmail = invoice.customer?.contacts?.find((contact) => contact.email)?.email;
  return contactEmail?.trim() || null;
}

export function toRecoveryInvoice(invoice: Invoice): RecoveryInvoice {
  return {
    ...invoice,
    daysOverdue: getDaysOverdue(invoice),
    status: getReminderStatus(invoice),
    recipientEmail: resolveRecipientEmail(invoice),
  };
}

export function getStageLabel(status: RecoveryStatus) {
  switch (status) {
    case "due-today":
      return "Due today";
    case "overdue-3":
      return "3+ days overdue";
    case "overdue-7":
      return "7+ days overdue";
    case "overdue-14":
      return "14+ days overdue";
    case "missing-due-date":
      return "Missing due date";
    case "paid":
      return "Paid";
    default:
      return "Watch list";
  }
}

export function getStageTone(status: RecoveryStatus) {
  switch (status) {
    case "due-today":
      return "amber";
    case "overdue-3":
      return "orange";
    case "overdue-7":
      return "rose";
    case "overdue-14":
      return "berry";
    case "missing-due-date":
      return "slate";
    case "paid":
      return "teal";
    default:
      return "sage";
  }
}


export function getRecoveryBuckets(invoices: RecoveryInvoice[]) {
  return {
    dueToday: invoices.filter((invoice) => invoice.status === "due-today"),
    overdue3: invoices.filter((invoice) => invoice.status === "overdue-3"),
    overdue7: invoices.filter((invoice) => invoice.status === "overdue-7"),
    overdue14: invoices.filter((invoice) => invoice.status === "overdue-14"),
    watch: invoices.filter((invoice) => invoice.status === "watch"),
    missingDueDate: invoices.filter((invoice) => invoice.status === "missing-due-date"),
  };
}
