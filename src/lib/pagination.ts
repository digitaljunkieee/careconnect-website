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

export function getResponsivePageSize(userAgent: string | null | undefined) {
  const normalized = (userAgent ?? "").toLowerCase();

  return /mobile|android|iphone|ipod|blackberry|iemobile|opera mini|windows phone/.test(
    normalized
  )
    ? 5
    : 10;
}

export function getSkip(page: number, pageSize: number) {
  return Math.max(page - 1, 0) * pageSize;
}

export function buildPageHref(
  basePath: string,
  query: Record<string, string | undefined> | undefined,
  page: number,
  pageParam = "page"
) {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  params.set(pageParam, String(page));

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function paginateItems<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const pageCount = Math.max(Math.ceil(total / pageSize), 1);
  const currentPage = clampNumber(page, 1, pageCount);
  const offset = getSkip(currentPage, pageSize);

  return {
    rows: items.slice(offset, offset + pageSize),
    total,
    page: currentPage,
    pageCount
  };
}
