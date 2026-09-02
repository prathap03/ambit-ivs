"use client";

import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import YearMonthPicker from "@/components/ui/year-month-picker";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCallback, useEffect, useState } from "react";
import { exportInvoicesToExcel } from "@/utils/exportExcel";
import { exportInvoicesToPdf } from "@/utils/exportPdf";
import { exportInvoiceToPdf } from "@/utils/exportInvoicePdf";
import { useDebounce } from "@/lib/useDebounce";
import { supabase } from "@/util/supabaseClient";

type SortKey = "date" | "client_name" | "total_amount";
type SortDir = "asc" | "desc";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FiMoreHorizontal, FiSearch, FiTrash2, FiDownload } from "react-icons/fi";
import { BiPencil } from "react-icons/bi";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { Bank, Invoice } from "@/types";
import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function ServiceBadge({ label, amount }: { label: string; amount: number | null }) {
  const colors: Record<string, string> = {
    Opinion: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    Vetting: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
    MODT: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-700",
  };
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold border whitespace-nowrap ${colors[label]}`}>
      {label} {amount}/-
    </span>
  );
}

interface DateValue {
  year: number;
  month: number;
}

export default function AmbitHome({ params }: { params: { clientName: string } }) {
  const currDate = new Date();
  const [selectedDate, setSelectedDate] = useState<DateValue>({ year: currDate.getFullYear(), month: currDate.getMonth() });
  const [invoiceData, setInvoiceData] = useState<Invoice[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const navigator = useRouter();
  const clientName = params.clientName;
  const [bankDetail, setBankDetail] = useState<Bank | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredData = [...invoiceData]
    .filter((inv) => inv.client_name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === "date") {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortDir === "asc" ? diff : -diff;
      }
      if (sortKey === "total_amount") {
        return sortDir === "asc" ? a.total_amount - b.total_amount : b.total_amount - a.total_amount;
      }
      const va = a.client_name.toLowerCase();
      const vb = b.client_name.toLowerCase();
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const deleteFunction = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from("invoices").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Invoice deleted");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
    setDeleteTargetId(null);
  };

  const downloadExcel = (): Promise<void> => {
    if (!bankDetail) return Promise.resolve();
    return new Promise<void>((resolve) => {
      exportInvoicesToExcel(
        invoiceData,
        totalAmount,
        bankDetail.bank_code.toUpperCase(),
        selectedDate.month,
        selectedDate.year
      );
      resolve();
    });
  };

  const fetchBankDetails = async (): Promise<Bank | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from("banks").select("*").eq("id", clientName);
      if (error || !data?.length) {
        setLoading(false);
        return null;
      }
      document.title = `${data[0].bank_name} Management`;
      setBankDetail(data[0]);
      return data[0];
    } catch {
      setLoading(false);
      return null;
    }
  };

  const fetchInvoices = useCallback(async () => {
    const bank = await fetchBankDetails();
    if (!bank) {
      toast.error("Bank not found");
      setTimeout(() => navigator.push("/"), 1000);
      return;
    }
    try {
      if (!selectedDate.year || selectedDate.month < 0 || !supabase) return;
      const startDate = new Date(selectedDate.year, selectedDate.month, 1, 0, 0, 0);
      const endDate = new Date(selectedDate.year, selectedDate.month + 1, 1, 0, 0, 0);

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("bank_company_name", bank.bank_name)
        .gt("date", startDate.toISOString())
        .lte("date", endDate.toISOString())
        .order("date", { ascending: true });

      if (error) {
        setLoading(false);
        return;
      }
      setInvoiceData(data);
      setTotalAmount(data.reduce((acc, inv) => acc + inv.total_amount, 0));
    } catch {
      // silently fail
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    setLoading(true);
    if (!supabase) return;
    fetchInvoices();

    const channel = supabase
      .channel("invoice-channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "invoices" }, fetchInvoices)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "invoices" }, fetchInvoices)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "invoices" }, (payload) => {
        setInvoiceData((prev) => {
          const updated = prev.map((inv) =>
            inv.id === payload.new.id ? { ...inv, ...payload.new } : inv
          );
          setTotalAmount(updated.reduce((acc, inv) => acc + inv.total_amount, 0));
          return updated;
        });
      })
      .subscribe();

    return () => { if (supabase) supabase.removeChannel(channel); };
  }, [selectedDate, fetchInvoices]);

  if (loading) return <LoadingSpinner />;

  return (
    <main className="flex flex-col h-full w-full dark:bg-gray-950 p-4 gap-3 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold text-xl text-gray-900 dark:text-white">
              {bankDetail?.bank_name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {MONTHS[selectedDate.month]} {selectedDate.year}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <YearMonthPicker
            selectedYear={selectedDate.year}
            selectedMonth={selectedDate.month}
            onChange={(date: DateValue) => setSelectedDate(date)}
          />
          <Button
            size="sm"
            onClick={() => {
              setLoading(true);
              navigator.push("/addInvoice/" + bankDetail?.id);
            }}
          >
            + Add Invoice
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={totalAmount === 0}
            onClick={() =>
              toast.promise(downloadExcel, {
                pending: "Generating report…",
                success: "Report generated ✅",
                error: "Failed to generate report ⚠️",
              })
            }
          >
            Export Excel
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={totalAmount === 0}
            onClick={() => bankDetail && exportInvoicesToPdf(invoiceData, totalAmount, bankDetail.bank_code.toUpperCase(), selectedDate.month, selectedDate.year)}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
        <input
          type="text"
          placeholder="Search by client name…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Table */}
      <div className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader className="bg-gray-900 dark:bg-gray-800 sticky top-0 z-10">
              <TableRow className="border-0 hover:bg-transparent">
                {[
                  { h: "#", w: "w-8", key: null },
                  { h: "Date", w: "min-w-[90px]", key: "date" as SortKey },
                  { h: "Client Name", w: "min-w-[140px]", key: "client_name" as SortKey },
                  { h: "File / App No.", w: "min-w-[110px]", key: null },
                  { h: "Opinion", w: "min-w-[100px]", key: null },
                  { h: "Vetting", w: "min-w-[100px]", key: null },
                  { h: "MODT", w: "min-w-[100px]", key: null },
                  { h: "Amount", w: "min-w-[90px] text-right", key: "total_amount" as SortKey },
                  { h: "", w: "w-8", key: null },
                ].map(({ h, w, key }) => (
                  <TableHead key={h || "actions"} className={`text-gray-200 font-semibold text-xs uppercase tracking-wide whitespace-nowrap py-3 ${w}`}>
                    {key ? (
                      <button onClick={() => toggleSort(key)} className="flex items-center gap-1 hover:text-white transition-colors">
                        {h}
                        <span className="opacity-60">{sortKey === key ? (sortDir === "asc" ? "▲" : "▼") : "▲▼"}</span>
                      </button>
                    ) : h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-20">
                    <div className="text-gray-400 dark:text-gray-500">
                      <p className="text-lg font-semibold mb-1">No invoices found</p>
                      <p className="text-sm">
                        {searchQuery
                          ? "No results match your search"
                          : `No invoices for ${MONTHS[selectedDate.month]} ${selectedDate.year}. Click "+ Add Invoice" to get started.`}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((data, index) => (
                  <TableRow
                    key={data.id}
                    className="border-b border-gray-100 dark:border-gray-800 even:bg-gray-50 dark:even:bg-gray-900/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    <TableCell className="text-gray-500 dark:text-gray-400 text-sm py-3 w-10">{index + 1}</TableCell>
                    <TableCell className="text-sm whitespace-nowrap py-3">{formatDate(data.date)}</TableCell>
                    <TableCell className="text-sm font-medium py-3">{data.client_name}</TableCell>
                    <TableCell className="text-sm font-mono text-gray-600 dark:text-gray-300 py-3">{data.file_number}</TableCell>
                    <TableCell className="py-3">
                      {data.opinion ? <ServiceBadge label="Opinion" amount={data.opinion_amount} /> : <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </TableCell>
                    <TableCell className="py-3">
                      {data.vetting ? <ServiceBadge label="Vetting" amount={data.vetting_amount} /> : <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </TableCell>
                    <TableCell className="py-3">
                      {data.modt ? <ServiceBadge label="MODT" amount={data.modt_amount} /> : <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums py-3 pr-4">₹{data.total_amount}/-</TableCell>
                    <TableCell className="py-3 w-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                          <FiMoreHorizontal size={18} className="cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[180px]">
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              onClick={() => navigator.push("/dashboard/editInvoice/" + data.id)}
                              className="flex items-center gap-3 text-sm py-2"
                            >
                              <BiPencil size={16} />
                              Edit Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => exportInvoiceToPdf(data)}
                              className="flex items-center gap-3 text-sm py-2"
                            >
                              <FiDownload size={16} />
                              Download Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => { e.preventDefault(); setDeleteTargetId(data.id); }}
                              className="flex items-center gap-3 text-sm py-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                            >
                              <FiTrash2 size={16} />
                              Delete Invoice
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {totalAmount > 0 && (
              <TableFooter className="bg-gray-50 dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700">
                <TableRow>
                  <TableCell colSpan={7} className="font-semibold text-gray-700 dark:text-gray-300 py-3">
                    Total ({filteredData.length} invoices)
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg tabular-nums py-3 pr-4">
                    ₹{filteredData.reduce((acc, inv) => acc + inv.total_amount, 0)}/-
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            )}
          </Table>
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Delete confirmation dialog (outside table) */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={() => setDeleteTargetId(null)}>
        <AlertDialogContent className="w-[90vw] max-w-[400px] rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-2">
            <button
              className="border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              onClick={() => setDeleteTargetId(null)}
            >
              Cancel
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              onClick={() => deleteTargetId && deleteFunction(deleteTargetId)}
            >
              Delete
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ToastContainer position="bottom-right" theme="colored" />
    </main>
  );
}
