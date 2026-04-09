import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Invoice } from "@/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function exportInvoicesToPdf(
  invoiceData: Invoice[],
  totalAmount: number,
  label: string,
  month: number,
  year: number,
  includeBank = false
) {
  const doc = new jsPDF({ orientation: "landscape" });
  const title = `${label} — ${MONTHS[month].slice(0, 3)}, ${year}`;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 14);

  const columns = [
    { header: "#", dataKey: "sno" },
    { header: "Date", dataKey: "date" },
    { header: "Client Name", dataKey: "client" },
    ...(includeBank ? [{ header: "Bank / Finance", dataKey: "bank" }] : []),
    { header: "File / App No.", dataKey: "fileNo" },
    { header: "Opinion", dataKey: "opinion" },
    { header: "Vetting", dataKey: "vetting" },
    { header: "MODT", dataKey: "modt" },
    { header: "Amount", dataKey: "total" },
  ];

  const rows: Record<string, string | number>[] = invoiceData.map((inv, i) => ({
    sno: i + 1,
    date: new Date(inv.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    client: inv.client_name,
    ...(includeBank ? { bank: inv.bank_company_name ?? "—" } : {}),
    fileNo: inv.file_number,
    opinion: inv.opinion ? `${inv.opinion_amount}/-` : "—",
    vetting: inv.vetting ? `${inv.vetting_amount}/-` : "—",
    modt: inv.modt ? `${inv.modt_amount}/-` : "—",
    total: `₹${inv.total_amount}/-`,
  }));

  rows.push({
    sno: "",
    date: "",
    client: "Total",
    ...(includeBank ? { bank: "" } : {}),
    fileNo: "",
    opinion: "",
    vetting: "",
    modt: "",
    total: `₹${totalAmount}/-`,
  });

  autoTable(doc, {
    columns,
    body: rows,
    startY: 20,
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 249, 250] },
    didParseCell: (data) => {
      // Bold + dark style for total row
      if (data.row.index === rows.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [30, 30, 30];
        data.cell.styles.textColor = [255, 255, 255];
      }
    },
  });

  doc.save(`${title}.pdf`);
}
