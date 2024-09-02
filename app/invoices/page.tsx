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
import { useRouter} from "next/navigation";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FiMoreHorizontal, FiTrash2 } from "react-icons/fi";
import { BiPencil } from "react-icons/bi";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast, ToastContainer } from "react-toastify";

export default function AmbitHome({ params }: { params: { clientName: string } }) {
  let currDate = new Date();
  const [selectedDate, setSelectedDate] = useState({ year: currDate.getFullYear() , month: currDate.getMonth() });
  const [invoiceData, setInvoiceData] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const navigator = useRouter();
  const [deleteAlert, setDeleteAlert] = useState<boolean>(false);
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
  const clientName = "Overall";
  const [loading, setLoading] = useState(true);

  const deleteFunction = async (id:string) => {
    if(!supabase){
      return;
    }
    try{
        const {data,error} = await supabase.from("invoices")
        .delete()
        .eq("id",id);

        if(data){
          toast.success("Invoice Removed")
        }
        if(error){
          toast.error(error.message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
        }

      } catch(error:any) {
        toast.error(error.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
      setDeleteAlert(false);
    };

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
      "Bank / Finance": data.bank_company_name ? data.bank_company_name : "-",
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
      "Bank / Finance":"",
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
      .gte("date", startDate.toISOString()) // Greater than or equal to the start date
      .lt("date", endDate.toISOString()) // Less than the start date of the next month
      .order("date", { ascending: true });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setInvoiceData(data);
    setLoading(false);
    setTotalAmount(
      data.reduce((acc, invoice) => acc + invoice.total_amount, 0)
    );
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

  if(loading){
    return (
      <div className="min-h-screen flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70">
  <div className="flex flex-auto flex-col justify-center items-center p-4 md:p-5">
    <div className="flex justify-center">
      <div className="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-black rounded-full dark:text-blue-500" role="status" aria-label="loading">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  </div>
</div>
    )
  }


  const handleDateChange = (date: Date): void => {
    setSelectedDate(date);
    console.log("Selected Year:", date.year, "Selected Month:", date.month);
  };

  return (
    <main className="flex max-h-screen flex-col  w-[100%] items-center justify-between dark:bg-black p-5 md:overflow-hidden">
      <div className="flex justify-between   w-full">
        <div>
        <h1 className="hidden md:block font-semibold text-[1.5rem]">Invoice Dashboard - {clientName}</h1>
        </div>
        <div className="flex gap-2">
        <YearMonthPicker
          selectedYear={selectedDate.year}
          selectedMonth={selectedDate.month}
          onChange={handleDateChange}
        />
        {/* <Button
          onClick={() => {
            navigator.push("/addInvoice/"+clientName?.toLowerCase());
          }}
        >
          Add Invoice
        </Button> */}
        <Button
          disabled={totalAmount > 0 ? false : true}
          onClick={downloadExcel}
        >
          {clientName} - Report
        </Button>
        </div>
      </div>
      <div className="flex outline-1 outline rounded-md shadow-md flex-grow h-screen w-full m-5">
        <ScrollArea  className="w-full  !h-[calc(100vh_-_145px)]">
          <Table className="w-full">
            <TableCaption className="style={{ animationDelay: `${index * 0.1}s` }}">
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
                <TableHead className="base:min-w-[110px] text-white tv:w-[110px]">
                  Bank / Finance
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
                  className="text-[0.9rem] opacity-0 animate-fade-in delay-[${index * 100}ms] border-b-[1px] MonaSans font-[400]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                                       <AlertDialog
        open={deleteAlert}
        onOpenChange={() => setDeleteAlert(false)}
      >
        <AlertDialogContent className="base:w-[90vw] tv:w-[400px] base:rounded-[10px] pb-[28px] !pt-[23px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Confirm to delete the Invoice data
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this Invoice Data?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="base:flex-row tv:flex-row base:justify-end base:gap-[10px]">
            <button
              className="border-[2px] hover:bg-[#ededed] tracking-wide text-[0.8rem] font-[450] px-[10px] py-[2px] rounded-[4px]"
              onClick={() => setDeleteAlert(false)}
            >
              Cancel
            </button>
            <button
              className={"bg-white text-[#e5484d] hover:text-white hover:bg-[#e5484d] text-[0.8rem] tracking-wide font-[450] px-[10px] py-[2px] flex justify-center items-center gap-1 rounded-[4px] border-[#e5484d] border"}
              onClick={()=>deleteFunction(data.id)}
            >
              Delete
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
                  <TableCell className="base:min-w-[180px] tv:w-[200px]">
                    {index + 1}.
                  </TableCell>
                  <TableCell className="base:min-w-[110px] tv:w-[110px]">
                    {data.date}
                  </TableCell>
                  <TableCell className="base:min-w-[120px] tv:w-[120px]">
                    {data.client_name}
                  </TableCell>
                  <TableCell className="base:min-w-[120px] tv:w-[120px]">
                    {data.bank_company_name}
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
                  <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <FiMoreHorizontal size={20} className="cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px] px-[10px] py-[10px] ">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                 navigator.push("/dashboard/editInvoice/"+data.id)
                }}
                className="flex items-center gap-[20px] text-[0.9rem] py-[8px] px-[10px]"
              >
                <BiPencil size={20} color="#344054" />
                Edit Invoice
              </DropdownMenuItem>

        


              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setDeleteAlert(true);
                }}
                className="flex items-center text-red-500 hover:text-red hover:bg-red-400 gap-[20px] text-[0.9rem] py-[8px] px-[10px]"
              >
                <FiTrash2 size={20} color="red" />
                Delete Invoice
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {totalAmount === 0 && (
                <>
                  <TableRow className="opacity-0 animate-fade-in delay-[${index * 100}ms]">
                    <TableCell
                      colSpan={9}
                      className="text-center text-[1.3rem] md:text-[2rem] h-[5rem]  MonaSans font-[600]"
                    >
                      No invoices found for {months[selectedDate.month]},{" "}
                      {selectedDate.year}
                    </TableCell>
                  </TableRow>
                  <TableRow className="opacity-0 animate-fade-in delay-[${index * 100}ms]">
                    <TableCell
                      colSpan={10}
                      className="text-center text-[1rem] h-[2rem]   MonaSans font-[400]"
                    >
                      Click on{" "}
                      <span className="font-semibold">
                        &quot;Add Invoice&quot;
                      </span>{" "}
                      to add new invoice
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
            {totalAmount > 0 && (
              <TableFooter className="opacity-0 animate-fade-in delay-[${index * 100}ms]">
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell></TableCell>
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
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" />
          <ToastContainer />
        </ScrollArea>
      </div>
    </main>
  );
}
