import { StatusPill } from "@/components/status-pill";

const flashMap: Record<
  string,
  { title: string; body: string; tone: "teal" | "amber" | "rose" | "slate" }
> = {
  "invoice-resent": {
    title: "Invoice resent from RepairShopr",
    body: "The customer should receive the native RepairShopr invoice email shortly.",
    tone: "teal",
  },
  "invoice-resend-failed": {
    title: "Invoice resend failed",
    body: "RepairShopr could not queue that invoice email. Check API credentials and permissions.",
    tone: "rose",
  },
  "reminder-sent": {
    title: "Reminder email sent",
    body: "Your custom reminder was delivered through the configured SMTP account.",
    tone: "teal",
  },
  "reminder-failed": {
    title: "Reminder email failed",
    body: "The reminder could not be sent. Re-check SMTP credentials and sender rules.",
    tone: "rose",
  },
  "mail-config-missing": {
    title: "SMTP is not configured",
    body: "Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM before sending custom reminders.",
    tone: "amber",
  },
  "recipient-missing": {
    title: "Recipient email missing",
    body: "This invoice has no reachable customer email, so the reminder was skipped.",
    tone: "slate",
  },
  "invoice-not-found": {
    title: "Invoice no longer available",
    body: "RepairShopr did not return an invoice for that request.",
    tone: "slate",
  },
  "invalid-stage": {
    title: "Invalid reminder stage",
    body: "The request did not include a valid reminder stage.",
    tone: "slate",
  },
};

export function FlashBanner({ flash }: { flash?: string | string[] }) {
  const key = Array.isArray(flash) ? flash[0] : flash;
  if (!key || !(key in flashMap)) {
    return null;
  }

  const message = flashMap[key];

  return (
    <section className="panel flex flex-col gap-3 border-[rgba(13,106,110,0.12)] bg-white/85 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-lg font-semibold text-[color:var(--foreground)]">
          {message.title}
        </p>
        <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
          {message.body}
        </p>
      </div>
      <StatusPill label="status" tone={message.tone} />
    </section>
  );
}
