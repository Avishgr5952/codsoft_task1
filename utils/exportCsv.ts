export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  headers: { key: keyof T; label: string }[]
): string {
  if (!data || data.length === 0) {
    return headers.map((h) => `"${h.label}"`).join(',') + '\n';
  }

  const headerRow = headers.map((h) => `"${h.label}"`).join(',');
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const raw = row[h.key];
        let valStr = '';
        if (raw === null || raw === undefined) {
          valStr = '';
        } else if (typeof raw === 'object') {
          valStr = JSON.stringify(raw);
        } else {
          valStr = String(raw);
        }
        // Escape quotes
        valStr = valStr.replace(/"/g, '""');
        return `"${valStr}"`;
      })
      .join(',')
  );

  return [headerRow, ...rows].join('\n');
}

export function downloadCSV(csvContent: string, filename: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
