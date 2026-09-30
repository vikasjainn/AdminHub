const escapeCell = (value: string | number): string => `"${String(value).replace(/"/g, '""')}"`;

/** Triggers a browser download of the given rows as a CSV file. */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const content = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
