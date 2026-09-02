import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Invoice } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function exportInvoiceToPdf(invoice: Invoice) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Ambit IVS", margin, 20);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Invoice Management System", margin, 26);

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("INVOICE", pageWidth - margin, 20, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`File / App No: ${invoice.file_number}`, pageWidth - margin, 26, { align: "right" });
  doc.text(`Date: ${formatDate(invoice.date)}`, pageWidth - margin, 31, { align: "right" });

  doc.setDrawColor(220);
  doc.line(margin, 36, pageWidth - margin, 36);

  // Bill to / Bank
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text("BILL TO", margin, 45);
  doc.text("BANK / FINANCE", pageWidth - margin, 45, { align: "right" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text(invoice.client_name, margin, 52);
  doc.text(invoice.bank_company_name ?? "—", pageWidth - margin, 52, { align: "right" });

  // Line items
  const rows: { service: string; amount: string }[] = [];
  if (invoice.opinion) rows.push({ service: "Legal Opinion", amount: `₹${invoice.opinion_amount ?? 0}/-` });
  if (invoice.vetting) rows.push({ service: "Vetting", amount: `₹${invoice.vetting_amount ?? 0}/-` });
  if (invoice.modt) rows.push({ service: "MODT", amount: `₹${invoice.modt_amount ?? 0}/-` });

  autoTable(doc, {
    startY: 62,
    columns: [
      { header: "Service", dataKey: "service" },
      { header: "Amount", dataKey: "amount" },
    ],
    body: rows,
    headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
    bodyStyles: { fontSize: 10 },
    columnStyles: { amount: { halign: "right" } },
  });

  const afterTableY = (doc as any).lastAutoTable.finalY + 6;

  doc.setDrawColor(220);
  doc.line(margin, afterTableY, pageWidth - margin, afterTableY);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Total", margin, afterTableY + 9);
  doc.text(`₹${invoice.total_amount}/-`, pageWidth - margin, afterTableY + 9, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(140);
  doc.text("Thank you for your business.", margin, afterTableY + 22);

  doc.save(`Invoice - ${invoice.client_name} - ${invoice.file_number}.pdf`);
}
