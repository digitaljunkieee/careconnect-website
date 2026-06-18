export function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function parsePage(value: string | null | undefined, fallback = 1) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parsePageSize(value: string | null | undefined, fallback = 10) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? clampNumber(parsed, 1, 50) : fallback;
}

export function getSkip(page: number, pageSize: number) {
  return Math.max(page - 1, 0) * pageSize;
}
