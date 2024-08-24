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
import { ScrollArea } from "@/components/ui/scroll-area"; // Use this instead of Radix UI's ScrollArea
import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import * as XLSXStyle from "sheetjs-style";
import { supabase } from "@/util/supabaseClient";
import { useRouter } from "next/navigation";

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

  interface Date {
    year: number;
    month: number;
  }

  const downloadExcel = () => {
    const wsData = invoiceData.map((data: any, index: number) => ({
      "S.No #": (index + 1).toString(),
      Name: data.clientName,
      Date: data.date,
      "File / Application Number": data.fileNumber,
      Opinion: data.opinion ? `${data.opinionAmount}/-` : "-",
      VETTING: data.vetting ? `${data.vettingAmount}/-` : "-",
      MODTD: data.modt ? `${data.modtAmount}/-` : "-",
      "AMOUNT IN RS": `${data.totalAmount}/-`,
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
      `Ambit Report - ${months[selectedDate.month]}, ${selectedDate.year}`
    );
    XLSXStyle.writeFile(
      wb,
      `Ambit Report - ${months[selectedDate.month]}, ${selectedDate.year}.xlsx`
    );
  };

 
  const fetchInvoices = useCallback(async () => {
    if (!selectedDate.year || !selectedDate.month || !supabase) return;

    // Define the start and end dates for the month
    const startDate = new Date(selectedDate.year, selectedDate.month , 1); // Start of the month
    const endDate = new Date(selectedDate.year, selectedDate.month+1, 1); // Start of the next month

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .gte("date", startDate.toISOString()) // Greater than or equal to the start date
      .lt("date", endDate.toISOString()) // Less than the start date of the next month
      .order("date", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setInvoiceData(data);
    setTotalAmount(data.reduce((acc, invoice) => acc + invoice.total_amount, 0));
  }, [selectedDate]);

  useEffect(() => {
    fetchInvoices();
    if (!supabase) return;

    // Setting up real-time subscription
    const channel = supabase
      .channel("invoice-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "invoices" },
        (payload) => {
          setInvoiceData((prev) => [...prev, payload.new]);
          setTotalAmount((prev) => prev + payload.new.totalAmount);
        }
      )
      .subscribe();

    return () => {
      // Cleaning up the subscription
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [selectedDate,fetchInvoices]);

  const handleDateChange = (date: Date): void => {
    setSelectedDate(date);
    console.log("Selected Year:", date.year, "Selected Month:", date.month);
  };

  return (
    <main className="flex max-h-screen flex-col items-center justify-between dark:bg-black p-5 overflow-hidden">
      <div className="flex gap-2 justify-end w-full">
        <YearMonthPicker
          selectedYear={selectedDate.year}
          selectedMonth={selectedDate.month}
          onChange={handleDateChange}
        />
        <Button
          onClick={() => {
            navigator.push("/addInvoice");
          }}
        >
          Add Invoice
        </Button>
        <Button
          disabled={totalAmount > 0 ? false : true}
          onClick={downloadExcel}
        >
          Ambit
        </Button>
      </div>
      <div className="flex outline-1 outline rounded-md shadow-md flex-grow h-screen w-full m-5">
        <ScrollArea className="w-full !h-[calc(100vh_-_145px)]">
          <Table>
            <TableCaption>
              Details of {months[selectedDate.month]}, {selectedDate.year}
            </TableCaption>
            <TableHeader className="!border-b-[3px] !z-[10] bg-black">
              <TableRow className="text-[0.9rem] border-b-[3px] MonaSans font-[600]">
                <TableHead className="base:min-w-[180px] text-white tv:w-[200px]">
                  S.No #
                </TableHead>
                <TableHead className="base:min-w-[110px] text-white tv:w-[110px]">
                  Date
                </TableHead>
                <TableHead className="base:min-w-[120px] text-white tv:w-[120px]">
                  Name
                </TableHead>
                <TableHead className="base:min-w-[100px] text-white tv:w-[100px]">
                  File / Application Number
                </TableHead>
                <TableHead className="base:min-w-[100px] text-white tv:w-[100px]">
                  Opinion
                </TableHead>
                <TableHead className="base:min-w-[100px] text-white tv:w-[100px]">
                  VETTING
                </TableHead>
                <TableHead className="base:min-w-[100px] text-white tv:w-[100px]">
                  MODTD
                </TableHead>
                <TableHead className="base:min-w-[100px] text-white tv:w-[100px]">
                  AMOUNT IN RS
                </TableHead>
                <TableHead className="base:min-w-[50px] text-white tv:w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoiceData.map((data: any, index) => (
                <TableRow
                  key={index}
                  className="text-[0.9rem] border-b-[1px] MonaSans font-[400]"
                >
                  <TableCell className="base:min-w-[180px] tv:w-[200px]">
                    {index + 1}.
                  </TableCell>
                  <TableCell className="base:min-w-[110px] tv:w-[110px]">
                    {data.date}
                  </TableCell>
                  <TableCell className="base:min-w-[120px] tv:w-[120px]">
                    {data.client_name}
                  </TableCell>
                  <TableCell className="base:min-w-[100px] tv:w-[100px]">
                    {data.file_number}
                  </TableCell>
                  <TableCell className="base:min-w-[100px] tv:w-[100px]">
                    {data.opinion ? data.opinion_amount + "/-" : "-"}
                  </TableCell>
                  <TableCell className="base:min-w-[100px] tv:w-[100px]">
                    {data.vetting ? data.vetting_amount + "/-" : "-"}
                  </TableCell>
                  <TableCell className="base:min-w-[100px] tv:w-[100px]">
                    {data.modt ? data.modt_amount + "/-" : "-"}
                  </TableCell>
                  <TableCell className="base:min-w-[100px] tv:w-[100px]">
                    {data.total_amount + "/-"}
                  </TableCell>
                  <TableCell className="base:min-w-[50px] tv:w-[50px]">
                    ...
                  </TableCell>
                </TableRow>
              ))}
              {totalAmount === 0 && (
                <>
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-[2rem] h-[5rem]  MonaSans font-[600]"
                    >
                      No invoices found for {months[selectedDate.month]},{" "}
                      {selectedDate.year}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-[1rem] h-[2rem]  MonaSans font-[400]"
                    >
                      Click on{" "}
                      <span className="font-semibold">{`&quot`}Add Invoice{`&quot`}</span> to
                      add new invoice
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
            {totalAmount > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-left">₹ {totalAmount}/-</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </ScrollArea>
      </div>
    </main>
  );
}
