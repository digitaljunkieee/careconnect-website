function escapeCsvValue(value: unknown) {
  const text =
    value instanceof Date
      ? value.toISOString()
      : typeof value === "string"
        ? value
        : value == null
          ? ""
          : String(value);

  if (/[,"\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: Array<{ key: keyof T; label: string }>
) {
  const header = columns.map((column) => escapeCsvValue(column.label)).join(",");
  const lines = rows.map((row) =>
    columns.map((column) => escapeCsvValue(row[column.key])).join(",")
  );

  return [header, ...lines].join("\n");
}

