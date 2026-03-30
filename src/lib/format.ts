import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function toCurrency(value: number | string, currency = "USD") {
  const amount =
    typeof value === "number" ? value : Number.parseFloat(value || "0");

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function toNumber(value: string | number | null | undefined) {
  const amount =
    typeof value === "number" ? value : Number.parseFloat(value || "0");
  return Number.isFinite(amount) ? amount : 0;
}

export function toDateLabel(value: string | null | undefined) {
  if (!value) {
    return "No due date";
  }

  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    return value;
  }

  return format(parsed, "dd MMM yyyy");
}

export function toRelativeTime(value: string | null | undefined) {
  if (!value) {
    return "No schedule";
  }

  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    return "Unknown";
  }

  return formatDistanceToNowStrict(parsed, { addSuffix: true });
}
