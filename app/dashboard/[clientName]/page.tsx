"use client";

import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import { useRouter } from "next/navigation";

export default function AmbitHome({ params }: { params: { clientName: string } }) {
  const [selectedDate, setSelectedDate] = useState({ year: 2024, month: 7 });
  const [invoiceData, setInvoiceData] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
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
  const clientName = params.clientName;
  const [bankDetail, setBankDetail] = useState<any>(null);



 

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
      `${bankDetail.bank_name} Report - ${months[selectedDate.month]}, ${selectedDate.year}`
    );
    XLSXStyle.writeFile(
      wb,
      `${bankDetail.bank_name} Report - ${months[selectedDate.month]}, ${selectedDate.year}.xlsx`
    );
    return new Promise(resolve => setTimeout(resolve, 1000));;
  };

  const fetchBankDetails = async()=>{
    if (!supabase) return;
    try{
    const {data,error} = await supabase.from("banks").select("*").eq("id",clientName);

      if(error){
        console.error(error);
        setLoading(false);
        return;
      }
      
      if(data){
        document.title = `${data[0].bank_name} Management`;
        setBankDetail(data[0]);
        return data[0];  
      }
      
    }catch(error){
      console.error(error);
      setLoading(false);
    }
   
  }

 

  const fetchInvoices = useCallback(async () => {
    const bank = await  fetchBankDetails();
    if(!bank){
      // setLoading(false);
      toast.error("Bank not found");
     setTimeout(() => {
      navigator.push("/");
     },1000)
      return;
    }
    try{
      if (!selectedDate.year || selectedDate.month<0  ||!supabase) return;

    // Define the start and end dates for the month
    const startDate = new Date(selectedDate.year, selectedDate.month, 1); // Start of the month
    const endDate = new Date(selectedDate.year, selectedDate.month + 1, 1); // Start of the next month

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("bank_company_name", bank.bank_name)
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
    }catch(error){
      console.error(error);
      setLoading(false);
    }
    
  }, [selectedDate]);

  useEffect(() => {
    setLoading(true);
    if (!supabase) return;
    
    
    
   
    fetchInvoices();


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

  return (
    <main className="flex max-h-screen flex-col  w-[100%] items-center justify-between dark:bg-black p-5 md:overflow-hidden">
{!loading ? (
  <>
        <div className="md:hidden mb-2 w-full text-md font-semibold">
        Invoice Dashboard - {bankDetail && bankDetail.bank_name}
       </div>
       <div className="flex justify-between   w-full">
         
         <div>
         <h1 className="hidden md:flex  w-full  font-semibold text-[1.5rem]">Invoice Dashboard - {bankDetail && bankDetail.bank_name}</h1>
         </div>
         <div className="flex justify-between md:justify-normal items-center  w-full md:w-auto gap-2">
         <YearMonthPicker
           selectedYear={selectedDate.year}
           selectedMonth={selectedDate.month}
           onChange={handleDateChange}
         />
         <Button
           onClick={() => {
            setLoading(true);
             navigator.push("/addInvoice/"+bankDetail.id);
           }}
         >
           Add Invoice
         </Button>
         <Button
           disabled={totalAmount > 0 ? false : true}
           onClick={()=>toast.promise(
              downloadExcel,
              {
                pending: 'Generating Report',
                success: 'Report Generated ✅',
                error: 'Error in generating report ⚠️'
              }
          )
            }
         >
           Generate 
         </Button>
         </div>
       </div>
       <div className="flex outline-1 outline rounded-md shadow-md flex-grow h-screen w-full m-5">
         <ScrollArea  className="w-full  !h-[calc(100vh_-_145px)]">
           <Table className="w-full">
             <TableCaption className="opacity-0 animate-fade-in delay-[${7 * 100}ms]">
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
                   className="text-[0.9rem] opacity-0 animate-fade-in delay-[${index * 100}ms] border-b-[1px] MonaSans font-[400]"
                   style={{ animationDelay: `${index * 0.1}s` }}
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
                   <TableRow className="opacity-0 animate-fade-in delay-[${2 * 100}ms]" >
                     <TableCell
                       colSpan={8}
                       className="text-center opacity-0 animate-fade-in delay-[${5 * 100}ms] text-[1.3rem] md:text-[2rem] h-[5rem]  MonaSans font-[600]"
                       style={{ animationDelay: `${5* 0.1}s` }}
                     >
                       No invoices found for {months[selectedDate.month]},{" "}
                       {selectedDate.year}
                     </TableCell>
                   </TableRow>
                   <TableRow className="opacity-0 animate-fade-in delay-[${3 * 100}ms]">
                     <TableCell
                       colSpan={8}
                       className="text-center text-[1rem] h-[2rem]  MonaSans font-[400]"
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
               <TableFooter className="opacity-0 animate-fade-in delay-[${5 * 100}ms]">
                 <TableRow>
                   <TableCell>Total</TableCell>
                   <TableCell></TableCell>
                   <TableCell></TableCell>
                   <TableCell></TableCell>
                   <TableCell></TableCell>
                   <TableCell></TableCell>
                   <TableCell></TableCell>
                   <TableCell className="text-left ">₹ {totalAmount}/-</TableCell>
                   <TableCell></TableCell>
                 </TableRow>
               </TableFooter>
             )}
           </Table>
           <ScrollBar orientation="vertical" />
           <ScrollBar orientation="horizontal" />
         </ScrollArea>
         <ToastContainer />
       </div>
       </>
) : ("Loading")}
    </main>
  );
}
