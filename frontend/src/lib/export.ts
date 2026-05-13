import * as XLSX from 'xlsx';

/**
 * Export an array of plain objects to a downloadable .xlsx file.
 * Column order = key order on the first row.
 */
export function exportToExcel<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
  sheetName = 'Sheet1',
): void {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)); // Excel sheet name limit
  const fname = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, fname);
}
