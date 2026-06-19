export function formatCurrency(value: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(value: Date | string | number) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium"
  }).format(new Date(value));
}

export function formatDateTime(value: Date | string | number) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatTime(value: string | Date) {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-GB", {
      timeStyle: "short"
    }).format(value);
  }

  return value;
}

export function formatName(firstName?: string, lastName?: string) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

export function formatRelativeTime(value: Date | string | number, now = new Date()) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffMs = date.getTime() - now.getTime();
  const absDiffMs = Math.abs(diffMs);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;
  const formatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto"
  });

  if (absDiffMs < minute) {
    return formatter.format(Math.round(diffMs / 1000), "second");
  }

  if (absDiffMs < hour) {
    return formatter.format(Math.round(diffMs / minute), "minute");
  }

  if (absDiffMs < day) {
    return formatter.format(Math.round(diffMs / hour), "hour");
  }

  if (absDiffMs < week) {
    return formatter.format(Math.round(diffMs / day), "day");
  }

  if (absDiffMs < month) {
    return formatter.format(Math.round(diffMs / week), "week");
  }

  if (absDiffMs < year) {
    return formatter.format(Math.round(diffMs / month), "month");
  }

  return formatter.format(Math.round(diffMs / year), "year");
}
