"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import YearMonthPicker from "@/components/ui/year-month-picker";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Use this instead of Radix UI's ScrollArea
import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import * as XLSXStyle from "sheetjs-style";
import { supabase } from "@/util/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import CardList from "./components/cardList";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState({ year: 2024, month: 7 });
  const [invoiceData, setInvoiceData] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigator = useRouter();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const searchParams = useSearchParams();
  const clientName = searchParams.get("clientName");

  useEffect(() => {
    if (clientName) {
      document.title = `${clientName} Management`;
    }
  }, [clientName]);

  interface Date {
    year: number;
    month: number;
  }

  const downloadExcel = () => {
    const wsData = invoiceData.map((data: any, index: number) => ({
      "S.No #": (index + 1).toString(),
      Name: data.client_name,
      Date: data.date,
      "File / Application Number": data.file_number,
      Opinion: data.opinion ? `${data.opinion_amount}/-` : "-",
      VETTING: data.vetting ? `${data.vetting_amount}/-` : "-",
      MODTD: data.modt ? `${data.modt_amount}/-` : "-",
      "AMOUNT IN RS": `${data.total_amount}/-`,
    }));

    wsData.push({
      "S.No #": "Total",
      Name: "",
      Date: "",
      "File / Application Number": "",
      Opinion: "",
      VETTING: "",
      MODTD: "",
      "AMOUNT IN RS": `₹ ${totalAmount}/-`,
    });

    const ws = XLSX.utils.json_to_sheet(wsData);

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

    const range = XLSX.utils.decode_range(ws["!ref"] || "");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ c: C, r: 0 });
      if (!ws[address]) continue;
      ws[address].s = headerStyle;
    }

    const totalRow = range.e.r;
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ c: C, r: totalRow });
      if (!ws[address]) continue;
      ws[address].s = totalStyle;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      `${clientName} Report - ${months[selectedDate.month]}, ${selectedDate.year}`
    );
    XLSXStyle.writeFile(
      wb,
      `${clientName} Report - ${months[selectedDate.month]}, ${selectedDate.year}.xlsx`
    );
  };

 

  const fetchInvoices = useCallback(async () => {
    if (!selectedDate.year || selectedDate.month<0 || !supabase) return;

    // Define the start and end dates for the month
    const startDate = new Date(selectedDate.year, selectedDate.month, 1); // Start of the month
    const endDate = new Date(selectedDate.year, selectedDate.month + 1, 1); // Start of the next month

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("bank_company_name", clientName?.toLowerCase())
      .gte("date", startDate.toISOString()) // Greater than or equal to the start date
      .lt("date", endDate.toISOString()) // Less than the start date of the next month
      .order("date", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setInvoiceData(data);
    setTotalAmount(
      data.reduce((acc, invoice) => acc + invoice.total_amount, 0)
    );
  }, [selectedDate,clientName]);

  useEffect(() => {
    fetchInvoices();
    if (!supabase) return;

    // Setting up real-time subscription
    const channel = supabase
      .channel("invoice-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "invoices" },

      fetchInvoices
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "invoices" },
        fetchInvoices
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "invoices" },
        (payload) => {
          setInvoiceData((prev) => {
            const updatedData = prev.map((invoice) =>
              invoice.id === payload.new.id
                ? { ...invoice, ...payload.new }
                : invoice
            );
            // Calculate the new total amount after the update
            const newTotalAmount = updatedData.reduce(
              (acc, invoice) => acc + invoice.total_amount,
              0
            );
            setTotalAmount(newTotalAmount);
            return updatedData;
          });
        }
      )
      .subscribe();

    return () => {
      // Cleaning up the subscription
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [selectedDate, fetchInvoices]);

  const handleDateChange = (date: Date): void => {
    setSelectedDate(date);
    console.log("Selected Year:", date.year, "Selected Month:", date.month);
  };

  return (
    <main className="flex max-h-screen flex-col items-center justify-between dark:bg-black p-5 md:overflow-hidden">
      
      <div className="flex outline-1 outline rounded-md shadow-md flex-grow h-screen w-full ">
        <ScrollArea  className="w-full  !h-[calc(100vh_-_145px)]">
          <CardList/>
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </main>
  );
}
