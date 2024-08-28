"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { supabase } from "@/util/supabaseClient";

export default function AddInvoice() {
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState("");
  const [fileNumber, setFileNumber] = useState("");
  const [opinion, setOpinion] = useState(false);
  const [vetting, setVetting] = useState(false);
  const [modt, setModt] = useState(false);
  const [opinionAmount, setOpinionAmount] = useState("2000");
  const [vettingAmount, setVettingAmount] = useState("500");
  const [modtAmount, setModtAmount] = useState("750");
  const navigator = useRouter();
  const totalAmount =
    ((opinion && Number(opinionAmount)) || 0) +
    ((vetting && Number(vettingAmount)) || 0) +
    ((modt && Number(modtAmount)) || 0);

  const handleDateChange = (date: any) => {
    const value = date;
    const formattedDate = date; // Format date to ISO 8601
    setDate(formattedDate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      file_number: `APPL${fileNumber}`,
      opinion,
      opinion_amount: opinion ? opinionAmount : null,
      vetting,
      vetting_amount: vetting ? vettingAmount : null,
      modt,
      modt_amount: modt ? modtAmount : null,
      total_amount: totalAmount,
      bank_company_name: "ambit",
    };
    if (!supabase) {
      alert(
        "Supabase client could not be created. Check your environment variables."
      );
      return;
    }

    // Save invoice to Supabase
    const { data, error } = await supabase.from("invoices").insert([invoice]);

    if (error) {
      console.error("Error inserting invoice:", error);
      alert("There was an error adding the invoice. Please try again.");
      return;
    }

    // Clear form fields
    setClientName("");
    setDate("");
    setFileNumber("");
    setOpinion(false);
    setVetting(false);
    setModt(false);
    setOpinionAmount("2000");
    setVettingAmount("750");
    setModtAmount("500");

    alert("Invoice added successfully!");
  };

  return (
    <div className="flex flex-grow flex-col max-h-screen min-h-screen overflow-hidden">
      <div className="p-2 flex items-center gap-2 bg-black text-white h-max w-[100%]">
        <ArrowLeftIcon
          className="w-6 h-6 cursor-pointer hover:text-blue-500 ease-linear"
          onClick={() => navigator.back()}
        />
        <h1 className="font-semibold text-2xl">Add Invoice - Ambit</h1>
      </div>
      <ScrollArea className="flex flex-grow h-screen p-4">
        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <div>
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

          <div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              File/Application Number
            </label>
            <div className="flex items-stretch mt-1">
              <h1 className="text-white flex items-center justify-center bg-black px-4 rounded-l-md">
                APPL
              </h1>
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
              className={`px-4 py-2 rounded-md shadow-sm font-semibold ${
                opinion
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => {
                setOpinion(!opinion);
                opinion ? setOpinionAmount("") : setOpinionAmount("2000");
              }}
            >
              Opinion
            </button>

            <button
              type="button"
              className={`px-4 py-2 rounded-md shadow-sm font-semibold ${
                vetting
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => {
                setVetting(!vetting);
                vetting ? setVettingAmount("") : setVettingAmount("500");
              }}
            >
              Vetting
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-md shadow-sm font-semibold ${
                modt ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => {
                setModt(!modt);
                modt ? setModtAmount("") : setModtAmount("750");
              }}
            >
              MODT
            </button>
          </div>

          {opinion && (
            <div>
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
            <div>
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
            <div>
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

          <div className="text-lg bg-black text-white p-2 rounded-md shadow-md font-semibold">
            Total Amount: {totalAmount} /-
          </div>

          <button
            type="submit"
            className="self-end px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Submit
          </button>
        </form>
      </ScrollArea>
    </div>
  );
}
