import "server-only";

function readString(value: string | undefined) {
  return value?.trim() || "";
}

export function getAppConfig() {
  const repairshoprSubdomain = readString(process.env.REPAIRSHOPR_SUBDOMAIN);
  const repairshoprApiKey = readString(process.env.REPAIRSHOPR_API_KEY);
  const n8nBaseUrl = readString(process.env.N8N_BASE_URL);
  const n8nApiKey = readString(process.env.N8N_API_KEY);

  return {
    repairshoprSubdomain,
    repairshoprApiKey,
    n8nBaseUrl,
    n8nApiKey,
    n8nWebhookBaseUrl: readString(process.env.N8N_WEBHOOK_BASE_URL),
    appCurrency: readString(process.env.APP_CURRENCY) || "USD",
    maxPages: Number(process.env.REPAIRSHOPR_MAX_PAGES || "5"),
  };
}

export function isRepairShoprConfigured() {
  const config = getAppConfig();
  return Boolean(config.repairshoprSubdomain && config.repairshoprApiKey);
}

export function isN8nConfigured() {
  const config = getAppConfig();
  return Boolean(config.n8nBaseUrl && config.n8nApiKey);
}

export function getAllowedEmails(): string[] {
  const raw = readString(process.env.ALLOWED_EMAILS);
  if (!raw) return [];
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowlistEnabled(): boolean {
  return getAllowedEmails().length > 0;
}

export function getGrandfatheredBefore(): Date | null {
  const raw = readString(process.env.GRANDFATHERED_BEFORE);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}
