"use client";

import { useEffect, useState } from "react";

import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { supabase } from "@/util/supabaseClient";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";

export default function AddInvoice({ params }: { params: { invoiceId: string } }) {
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState("");
  const [fileNumber, setFileNumber] = useState("");
  const [opinion, setOpinion] = useState(false);
  const [vetting, setVetting] = useState(false);
  const [modt, setModt] = useState(false);
  const [opinionAmount, setOpinionAmount] = useState("0");
  const [vettingAmount, setVettingAmount] = useState("0");
  const [modtAmount, setModtAmount] = useState("0");
  const [bankDetail, setBankDetail] = useState<any>(null);
  const navigator = useRouter();
  const [loading, setLoading] = useState(true);
  const invoiceId = params.invoiceId;
  const totalAmount =
    ((opinion && Number(opinionAmount)) || 0) +
    ((vetting && Number(vettingAmount)) || 0) +
    ((modt && Number(modtAmount)) || 0);

  const handleDateChange = (date: any) => {
    const formattedDate = date; // Format date to ISO 8601
    setDate(formattedDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    // Validate inputs
    if (!clientName || !date || !fileNumber) {
      alert("Please fill in all required fields.");
      return;
    }

    if (
      opinion &&
      (Number(opinionAmount) <= 0 || isNaN(Number(opinionAmount)))
    ) {
      alert("Please enter a valid opinion amount.");
      return;
    }

    if (
      vetting &&
      (Number(vettingAmount) <= 0 || isNaN(Number(vettingAmount)))
    ) {
      alert("Please enter a valid vetting amount.");
      return;
    }

    if (modt && (Number(modtAmount) <= 0 || isNaN(Number(modtAmount)))) {
      alert("Please enter a valid MODT amount.");
      return;
    }

    // Create invoice object
    const invoice = {
      client_name:clientName,
      date:new Date(date).toISOString(),
      file_number: `${fileNumber}`,
      opinion,
      opinion_amount: opinion ? opinionAmount : null,
      vetting,
      vetting_amount: vetting ? vettingAmount : null,
      modt,
      modt_amount: modt ? modtAmount : null,
      total_amount: totalAmount,
      bank_company_name: bankDetail.bank_name,
    };
    if (!supabase) {
      alert(
        "Supabase client could not be created. Check your environment variables."
      );
      return;
    }

    // Save invoice to Supabase
    const { data, error } = await supabase.from("invoices").update(invoice).eq("id",invoiceId)

    if (error) {
      console.error("Error inserting invoice:", error);
      alert("There was an error updating the invoice. Please try again.");
      return;
    }

    // Clear form fields
    navigator.back()
    setClientName("");
    setDate("");
    setFileNumber("");
    setOpinion(false);
    setVetting(false);
    setModt(false);
    setOpinionAmount(bankDetail.bank_opinion_amount);
    setVettingAmount(bankDetail.bank_vetting_amount);
    setModtAmount(bankDetail.bank_modt_amount);

    alert("Invoice updated successfully!");
  };

  const fetchInvoiceDetails = async()=>{
    if (!supabase) return;
    
    const {data,error} = await supabase.from("invoices").select("*").eq("id",invoiceId);
    if(error){
      console.error(error);
      setLoading(false);
      navigator.back()
      return;
    }
    
    if(data){
      document.title = `${data[0].bank_name} Management`;
      setBankDetail(data[0]);
      setClientName(data[0].client_name)
      handleDateChange(data[0].date)
      setFileNumber(data[0].file_number)
      setOpinion(data[0].opinion)
      setOpinionAmount(data[0].opinion_amount || 0);
      setVetting(data[0].vetting)
      setVettingAmount(data[0].vetting_amount || 0);
      setModt(data[0].modt)
      setModtAmount(data[0].modt_amount);
      setLoading(false);
      return data[0];  
    }
    
  }

  useEffect(() => {
    fetchInvoiceDetails();
  },[])

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
    <div className="flex flex-grow flex-col h-screen min-h-screen overflow-hidden">
{  bankDetail ?    (<><div className="p-2 flex items-center gap-2 bg-black text-white h-max  w-[100%]">
        <ArrowLeftIcon
          className="w-6 h-6 cursor-pointer hover:text-blue-500 ease-linear"
          onClick={() => navigator.back()}
        />
        <h1 className="font-semibold text-2xl">Edit Invoice - {bankDetail.client_name} ({bankDetail.bank_company_name})</h1>
      </div>
      <ScrollArea className="flex w-full  overflow-x-auto  flex-grow p-4">
        <form className="flex flex-col w-full space-y-4" onSubmit={handleSubmit}>
          <div className="opacity-0 animate-fade-in delay-[${1 * 100}ms]">
            <label className="block text-sm font-medium text-gray-700">
              Client Name
            </label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter client name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <div className="opacity-0 animate-fade-in delay-[${2 * 100}ms]">
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>

          <div className="opacity-0 animate-fade-in delay-[${3 * 100}ms]">
            <label className="block text-sm font-medium text-gray-700">
              File/Application Number
            </label>
            <div className="flex items-stretch mt-1">
              
              <input
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="File/Application Number"
                value={fileNumber}
                onChange={(e) => setFileNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              className={`px-4 py-2 opacity-0 animate-fade-in delay-[${4 * 100}ms] rounded-md shadow-sm font-semibold ${
                opinion
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => {
                setOpinion(!opinion);
                opinion ? setOpinionAmount("") : setOpinionAmount(bankDetail.opinion_amount);
              }}
            >
              Opinion
            </button>

            <button
              type="button"
              className={`px-4 py-2 rounded-md opacity-0 animate-fade-in delay-[${5 * 100}ms] shadow-sm font-semibold ${
                vetting
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => {
                setVetting(!vetting);
                vetting ? setVettingAmount("") : setVettingAmount(bankDetail.vetting_amount);
              }}
            >
              Vetting
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-md opacity-0 animate-fade-in delay-[${6 * 100}ms] shadow-sm font-semibold ${
                modt ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => {
                setModt(!modt);
                modt ? setModtAmount("") : setModtAmount(bankDetail.modt_amount);
              }}
            >
              MODT
            </button>
          </div>

          {opinion && (
            <div className="opacity-0 animate-fade-in delay-[${2 * 100}ms]">
              <label className="block text-sm font-medium text-gray-700">
                Opinion Amount
              </label>
              <input
                type="number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter opinion amount"
                value={opinionAmount}
                min="0"
                max="10000"
                onChange={(e) =>
                  setOpinionAmount(
                    e.target.value === "0" ||
                      Number(e.target.value) < 0 ||
                      !Number(e.target.value)
                      ? ""
                      : e.target.value
                  )
                }
              />
            </div>
          )}

          {vetting && (
            <div className="opacity-0 animate-fade-in delay-[${2 * 100}ms]">
              <label className="block text-sm font-medium text-gray-700">
                Vetting Amount
              </label>
              <input
                type="number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter vetting amount"
                value={vettingAmount}
                min="0"
                max="10000"
                onChange={(e) =>
                  setVettingAmount(
                    e.target.value === "0" ||
                      Number(e.target.value) < 0 ||
                      !Number(e.target.value)
                      ? ""
                      : e.target.value
                  )
                }
              />
            </div>
          )}

          {modt && (
            <div className="opacity-0 animate-fade-in delay-[${2 * 100}ms]">
              <label className="block text-sm font-medium text-gray-700">
                MODT Amount
              </label>
              <input
                type="number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter MODT amount"
                value={modtAmount}
                min="0"
                max="10000"
                onChange={(e) =>
                  setModtAmount(
                    e.target.value === "0" ||
                      Number(e.target.value) < 0 ||
                      !Number(e.target.value)
                      ? ""
                      : e.target.value
                  )
                }
              />
            </div>
          )}

          <div className="text-lg opacity-0 animate-fade-in delay-[${8 * 100}ms] bg-black text-white p-2 rounded-md shadow-md font-semibold">
            Total Amount: {totalAmount} /-
          </div>

          <div className="flex-grow flex justify-end  items-start">
          <button
            type="submit"
            className="px-4 py-2 mb-[5rem] md:mb-5 opacity-0 animate-fade-in delay-[${9 * 100}ms] bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit
          </button>
          </div>
        </form>
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      </>) : <div className="flex items-center justify-center h-full w-full">Loading...</div>}
    </div>
  );
}
