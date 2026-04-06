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

  "workflow-activated": {
    title: "Workflow published",
    body: "The selected n8n workflow is now active from this console.",
    tone: "teal",
  },
  "workflow-deactivated": {
    title: "Workflow paused",
    body: "The selected n8n workflow has been deactivated.",
    tone: "amber",
  },
  "workflow-action-failed": {
    title: "Workflow update failed",
    body: "The n8n API did not accept that workflow change. Re-check the instance URL and API key.",
    tone: "rose",
  },
  "n8n-config-missing": {
    title: "n8n is not configured",
    body: "Set N8N_BASE_URL and N8N_API_KEY before managing workflows from this app.",
    tone: "amber",
  },
};

export function FlashBanner({ flash }: { flash?: string | string[] }) {
  const key = Array.isArray(flash) ? flash[0] : flash;
  if (!key || !(key in flashMap)) {
    return null;
  }

  const message = flashMap[key];

  return (
    <section className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex items-start gap-2.5">
        <span className="mt-1.5 h-2 w-2 rounded-full bg-[var(--accent)]" />
        <div>
          <p className="text-base font-semibold text-[var(--foreground)]">
            {message.title}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            {message.body}
          </p>
        </div>
      </div>
      <StatusPill label="status" tone={message.tone} />
    </section>
  );
}
