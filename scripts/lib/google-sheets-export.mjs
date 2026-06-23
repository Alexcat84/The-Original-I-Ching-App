/**
 * Build .xlsx workbooks for Google Sheets (import or upload).
 */
import * as XLSX from "xlsx";

/** @param {number} row 1-based sheet row (header = row 1) */
export function datasetEpubMatchFormula(row) {
  return `IF(F${row}="","",IF(EXACT(E${row},F${row}),"OK","FAIL"))`;
}

/**
 * @param {string[]} headers
 * @param {string[][]} dataRows
 * @param {{ columnWidths?: number[]; freezeRows?: number; freezeCols?: number; wrapTextCols?: number[] }} [opts]
 */
export function buildPlainSheet(headers, dataRows, opts = {}) {
  const aoa = [headers, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  if (opts.columnWidths?.length) {
    ws["!cols"] = opts.columnWidths.map((wch) => ({ wch }));
  }

  const wrapCols = opts.wrapTextCols ?? [];
  if (wrapCols.length) {
    for (let r = 1; r < aoa.length; r++) {
      for (const c of wrapCols) {
        const addr = XLSX.utils.encode_cell({ r, c });
        if (!ws[addr]) continue;
        ws[addr].s = { alignment: { wrapText: true, vertical: "top" } };
      }
    }
  }

  const freezeRows = opts.freezeRows ?? 1;
  const freezeCols = opts.freezeCols ?? 0;
  if (freezeRows > 0 || freezeCols > 0) {
    const topLeft =
      freezeCols > 0
        ? String.fromCharCode(65 + freezeCols) + String(freezeRows + 1)
        : `A${freezeRows + 1}`;
    ws["!freeze"] = {
      xSplit: freezeCols,
      ySplit: freezeRows,
      topLeftCell: topLeft,
      activePane: "bottomRight",
    };
  }

  return ws;
}

/**
 * @param {string[]} headers
 * @param {string[][]} dataRows plain string rows (cols A–F); col G gets formula
 */
export function buildVerifySheet(headers, dataRows) {
  const rowsWithFormulaCol = dataRows.map((r) => [...r, ""]);
  const ws = buildPlainSheet(headers, rowsWithFormulaCol, {
    columnWidths: [5, 5, 10, 14, 72, 72, 12],
    freezeRows: 1,
    freezeCols: 0,
  });

  for (let i = 0; i < dataRows.length; i++) {
    const rowNum = i + 2;
    ws[`G${rowNum}`] = { t: "s", f: datasetEpubMatchFormula(rowNum) };
  }

  return ws;
}

/**
 * @param {string} path
 * @param {Array<{ name: string; headers: string[]; rows: string[][]; columnWidths?: number[]; freezeRows?: number; freezeCols?: number; wrapTextCols?: number[] }>} sheets
 * @param {"plain"|"verify"} [mode]
 */
export function writeGoogleSheetsWorkbook(path, sheets, mode = "verify") {
  const wb = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const ws =
      mode === "plain"
        ? buildPlainSheet(sheet.headers, sheet.rows, {
            columnWidths: sheet.columnWidths,
            freezeRows: sheet.freezeRows,
            freezeCols: sheet.freezeCols,
            wrapTextCols: sheet.wrapTextCols,
          })
        : buildVerifySheet(sheet.headers, sheet.rows);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  }
  XLSX.writeFile(wb, path, { bookType: "xlsx", type: "file", cellStyles: true });
}
