import "server-only";

function readString(value: string | undefined) {
  return value?.trim() || "";
}

export function getAppConfig() {
  const repairshoprSubdomain = readString(process.env.REPAIRSHOPR_SUBDOMAIN);
  const repairshoprApiKey = readString(process.env.REPAIRSHOPR_API_KEY);
  const smtpHost = readString(process.env.SMTP_HOST);
  const smtpUser = readString(process.env.SMTP_USER);
  const smtpPass = readString(process.env.SMTP_PASS);

  return {
    repairshoprSubdomain,
    repairshoprApiKey,
    appCurrency: readString(process.env.APP_CURRENCY) || "USD",
    maxPages: Number(process.env.REPAIRSHOPR_MAX_PAGES || "5"),
    smtpHost,
    smtpPort: Number(process.env.SMTP_PORT || "587"),
    smtpSecure: process.env.SMTP_SECURE === "true",
    smtpUser,
    smtpPass,
    smtpFrom: readString(process.env.SMTP_FROM),
  };
}

export function isRepairShoprConfigured() {
  const config = getAppConfig();
  return Boolean(config.repairshoprSubdomain && config.repairshoprApiKey);
}

export function isMailConfigured() {
  const config = getAppConfig();
  return Boolean(
    config.smtpHost &&
      config.smtpPort &&
      config.smtpFrom &&
      config.smtpUser &&
      config.smtpPass,
  );
}
