/**
 * Minimal Excel 2003 XML Spreadsheet writer (no external deps).
 * Opens natively in Microsoft Excel on Windows.
 */

/** @typedef {string | { formula: string; value?: string }} ExcelCell */

/**
 * @param {string} s
 */
export function xmlEscape(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n/g, "&#10;");
}

/**
 * @param {ExcelCell} cell
 */
function cellXml(cell) {
  if (cell && typeof cell === "object" && "formula" in cell) {
    return `<Cell ss:Formula="${xmlEscape(cell.formula)}"><Data ss:Type="String">${xmlEscape(cell.value ?? "")}</Data></Cell>`;
  }
  return `<Cell><Data ss:Type="String">${xmlEscape(cell)}</Data></Cell>`;
}

/**
 * @param {string} name
 * @param {string[]} headers
 * @param {ExcelCell[][]} rows
 * @param {{ columnWidths?: number[] }} [opts]
 */
export function buildExcelXmlSheet(name, headers, rows, opts = {}) {
  const headerRow = headers
    .map((h) => `<Cell><Data ss:Type="String">${xmlEscape(h)}</Data></Cell>`)
    .join("");

  const widthXml = (opts.columnWidths ?? [])
    .map((w) => `<Column ss:Width="${w}"/>`)
    .join("");

  const body = rows
    .map((row) => {
      const cells = row.map((cell) => cellXml(cell)).join("");
      return `<Row>${cells}</Row>`;
    })
    .join("\n");

  return `<Worksheet ss:Name="${xmlEscape(name)}">
<Table>
${widthXml}
<Row ss:StyleID="Header">${headerRow}</Row>
${body}
</Table>
</Worksheet>`;
}

/**
 * @param {Array<{ name: string; headers: string[]; rows: ExcelCell[][]; columnWidths?: number[] }>} sheets
 */
export function buildExcelXmlWorkbook(sheets) {
  const sheetXml = sheets
    .map((s) =>
      buildExcelXmlSheet(s.name, s.headers, s.rows, { columnWidths: s.columnWidths }),
    )
    .join("\n");
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
  <Style ss:ID="Header">
    <Font ss:Bold="1"/>
  </Style>
</Styles>
${sheetXml}
</Workbook>`;
}

/**
 * Compare dataset vs pasted EPUB text (exact, including line breaks).
 * @param {number} row Excel row number (1-based, includes header)
 */
export function datasetEpubMatchFormula(row) {
  return `=IF(F${row}="","",IF(EXACT(E${row},F${row}),"OK","FAIL"))`;
}
