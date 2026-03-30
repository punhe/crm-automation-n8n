"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { isMailConfigured } from "@/lib/env";
import { toCurrency, toDateLabel } from "@/lib/format";
import { sendMail } from "@/lib/mail";
import {
  getReminderSubject,
  resolveRecipientEmail,
} from "@/lib/reminders";
import { getInvoiceById, resendInvoiceEmail } from "@/lib/repairshopr";
import type { ReminderStage } from "@/lib/types";

const allowedStages = new Set<ReminderStage>([
  "due-today",
  "overdue-3",
  "overdue-7",
  "overdue-14",
]);

function withFlash(returnTo: string, flash: string) {
  const url = new URL(returnTo || "/", "http://localhost");
  url.searchParams.set("flash", flash);
  return `${url.pathname}${url.search}`;
}

function reminderCopy(stage: ReminderStage) {
  switch (stage) {
    case "due-today":
      return {
        headline: "A quick reminder that your invoice is due today.",
        closing: "If you've already scheduled payment, you can ignore this note.",
      };
    case "overdue-3":
      return {
        headline: "Your invoice is now 3 days overdue.",
        closing: "Please reply if anything is blocking payment and we will help immediately.",
      };
    case "overdue-7":
      return {
        headline: "Your invoice is now 7 days overdue and needs attention.",
        closing: "Please confirm payment timing so we can keep your account in a healthy state.",
      };
    case "overdue-14":
      return {
        headline: "This is the final reminder before we escalate internally.",
        closing: "Please reply today with a payment update or remittance confirmation.",
      };
  }
}

export async function resendInvoiceEmailAction(formData: FormData) {
  await requireUser();

  const invoiceId = Number(formData.get("invoiceId"));
  const returnTo = String(formData.get("returnTo") || "/invoices");

  try {
    await resendInvoiceEmail(invoiceId);
    revalidatePath("/");
    revalidatePath("/invoices");
    revalidatePath("/recovery");
    redirect(withFlash(returnTo, "invoice-resent"));
  } catch {
    redirect(withFlash(returnTo, "invoice-resend-failed"));
  }
}

export async function sendReminderEmailAction(formData: FormData) {
  await requireUser();

  const invoiceId = Number(formData.get("invoiceId"));
  const stage = String(formData.get("stage")) as ReminderStage;
  const returnTo = String(formData.get("returnTo") || "/recovery");

  if (!allowedStages.has(stage)) {
    redirect(withFlash(returnTo, "invalid-stage"));
  }

  if (!isMailConfigured()) {
    redirect(withFlash(returnTo, "mail-config-missing"));
  }

  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    redirect(withFlash(returnTo, "invoice-not-found"));
  }

  const recipientEmail = resolveRecipientEmail(invoice);
  if (!recipientEmail || invoice.customer?.no_email) {
    redirect(withFlash(returnTo, "recipient-missing"));
  }

  const copy = reminderCopy(stage);
  const subject = getReminderSubject(invoice.number, stage);
  const customerName =
    invoice.customer?.business_name ||
    invoice.customer?.fullname ||
    invoice.customer_business_then_name;
  const dueDate = toDateLabel(invoice.due_date);
  const amount = toCurrency(invoice.total);

  const html = `
    <div style="font-family: Arial, sans-serif; background:#fffaf1; padding:32px; color:#1f2a26;">
      <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e7dccb; border-radius:24px; padding:32px;">
        <p style="font-size:12px; text-transform:uppercase; letter-spacing:0.24em; color:#7a6d58; margin:0 0 16px;">
          RepairShopr Revenue Console
        </p>
        <h1 style="font-size:28px; margin:0 0 14px; line-height:1.15;">${copy.headline}</h1>
        <p style="font-size:16px; line-height:1.7; margin:0 0 20px;">
          Hi ${customerName},
        </p>
        <p style="font-size:16px; line-height:1.7; margin:0 0 20px;">
          We wanted to follow up on invoice <strong>${invoice.number}</strong> for <strong>${amount}</strong>, with a due date of <strong>${dueDate}</strong>.
        </p>
        <div style="border:1px solid #efe6d8; border-radius:18px; padding:18px 20px; background:#fbf6ec; margin:0 0 20px;">
          <p style="margin:0 0 8px; font-size:14px;"><strong>Invoice number:</strong> ${invoice.number}</p>
          <p style="margin:0 0 8px; font-size:14px;"><strong>Amount:</strong> ${amount}</p>
          <p style="margin:0; font-size:14px;"><strong>Due date:</strong> ${dueDate}</p>
        </div>
        <p style="font-size:16px; line-height:1.7; margin:0 0 20px;">
          ${copy.closing}
        </p>
        ${
          invoice.pdf_url
            ? `<p style="font-size:16px; line-height:1.7; margin:0 0 20px;">Invoice copy: <a href="${invoice.pdf_url}" style="color:#0d6a6e;">${invoice.pdf_url}</a></p>`
            : ""
        }
        <p style="font-size:16px; line-height:1.7; margin:0;">
          Thank you,
          <br />
          Billing Team
        </p>
      </div>
    </div>
  `;

  const text = [
    copy.headline,
    "",
    `Invoice: ${invoice.number}`,
    `Amount: ${amount}`,
    `Due date: ${dueDate}`,
    "",
    copy.closing,
    invoice.pdf_url ? `Invoice copy: ${invoice.pdf_url}` : "",
    "",
    "Thank you,",
    "Billing Team",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await sendMail({
      to: recipientEmail,
      subject,
      text,
      html,
    });

    revalidatePath("/");
    revalidatePath("/invoices");
    revalidatePath("/recovery");
    redirect(withFlash(returnTo, "reminder-sent"));
  } catch {
    redirect(withFlash(returnTo, "reminder-failed"));
  }
}
