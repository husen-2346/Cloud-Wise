export interface CsvColumn<T> {
  header: string;
  key: keyof T | ((row: T) => string | number | null | undefined);
}

export function exportCsv<T>(
  filename: string,
  columns: CsvColumn<T>[],
  data: T[],
) {
  if (data.length === 0) return;

  const escapeCell = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headers = columns.map((col) => escapeCell(col.header)).join(',');
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const val = typeof col.key === 'function' ? col.key(row) : (row as Record<string, unknown>)[col.key as string];
        return escapeCell(val);
      })
      .join(','),
  );

  const csvContent = [headers, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
