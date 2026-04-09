import * as XLSX from "xlsx";
import * as XLSXStyle from "sheetjs-style";
import { Invoice } from "@/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const headerStyle = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "000000" } },
  alignment: { horizontal: "center" },
};

const totalStyle = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "000000" } },
  alignment: { horizontal: "center" },
};

function applyRowStyle(ws: XLSX.WorkSheet, rowIndex: number, style: object) {
  const range = XLSX.utils.decode_range(ws["!ref"] || "");
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_cell({ c: C, r: rowIndex });
    if (!ws[address]) continue;
    ws[address].s = style;
  }
}

export function exportInvoicesToExcel(
  invoiceData: Invoice[],
  totalAmount: number,
  label: string,
  month: number,
  year: number,
  includeBank = false
) {
  const wsData = invoiceData.map((data, index) => {
    const row: Record<string, string> = {
      "S.No #": (index + 1).toString(),
      Name: data.client_name,
      Date: new Date(data.date).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      }),
      "File / Application Number": data.file_number,
      Opinion: data.opinion ? `${data.opinion_amount}/-` : "-",
      VETTING: data.vetting ? `${data.vetting_amount}/-` : "-",
      MODTD: data.modt ? `${data.modt_amount}/-` : "-",
      "AMOUNT IN RS": `${data.total_amount}/-`,
    };
    if (includeBank) {
      row["Bank / Finance"] = data.bank_company_name ?? "-";
    }
    return row;
  });

  wsData.push({
    "S.No #": "Total",
    Name: "",
    ...(includeBank ? { "Bank / Finance": "" } : {}),
    Date: "",
    "File / Application Number": "",
    Opinion: "",
    VETTING: "",
    MODTD: "",
    "AMOUNT IN RS": `₹ ${totalAmount}/-`,
  });

  const ws = XLSX.utils.json_to_sheet(wsData);
  const range = XLSX.utils.decode_range(ws["!ref"] || "");

  applyRowStyle(ws, 0, headerStyle);
  applyRowStyle(ws, range.e.r, totalStyle);

  const wb = XLSX.utils.book_new();
  const sheetName = `${label} - ${MONTHS[month].slice(0, 3)}, ${year}`;
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSXStyle.writeFile(wb, `${sheetName}.xlsx`);
}
