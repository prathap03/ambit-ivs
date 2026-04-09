"use client";

import { useEffect, useState } from "react";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { supabase } from "@/util/supabaseClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { Bank } from "@/types";

export default function AddInvoice({ params }: { params: { clientId: string } }) {
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState("");
  const [fileNumber, setFileNumber] = useState("");
  const [opinion, setOpinion] = useState(false);
  const [vetting, setVetting] = useState(false);
  const [modt, setModt] = useState(false);
  const [opinionAmount, setOpinionAmount] = useState("0");
  const [vettingAmount, setVettingAmount] = useState("0");
  const [modtAmount, setModtAmount] = useState("0");
  const [bankDetail, setBankDetail] = useState<Bank | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const navigator = useRouter();

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleBack = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Leave anyway?")) return;
    navigator.back();
  };
  const clientId = params.clientId;

  const totalAmount =
    ((opinion && Number(opinionAmount)) || 0) +
    ((vetting && Number(vettingAmount)) || 0) +
    ((modt && Number(modtAmount)) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName || !date || !fileNumber) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (opinion && (Number(opinionAmount) <= 0 || isNaN(Number(opinionAmount)))) {
      toast.error("Please enter a valid opinion amount.");
      return;
    }
    if (vetting && (Number(vettingAmount) <= 0 || isNaN(Number(vettingAmount)))) {
      toast.error("Please enter a valid vetting amount.");
      return;
    }
    if (modt && (Number(modtAmount) <= 0 || isNaN(Number(modtAmount)))) {
      toast.error("Please enter a valid MODT amount.");
      return;
    }
    if (!supabase || !bankDetail) {
      toast.error("Connection error. Check your environment variables.");
      return;
    }

    setSubmitting(true);
    const invoice = {
      client_name: clientName,
      date: new Date(date).toISOString(),
      file_number: fileNumber,
      opinion,
      opinion_amount: opinion ? opinionAmount : null,
      vetting,
      vetting_amount: vetting ? vettingAmount : null,
      modt,
      modt_amount: modt ? modtAmount : null,
      total_amount: totalAmount,
      bank_company_name: bankDetail.bank_name,
    };

    const { error } = await supabase.from("invoices").insert([invoice]);
    setSubmitting(false);

    if (error) {
      toast.error("Failed to add invoice. Please try again.");
      return;
    }

    setIsDirty(false);
    toast.success("Invoice added successfully!");
    setTimeout(() => navigator.back(), 800);
  };

  const fetchBankDetails = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from("banks").select("*").eq("id", clientId);
    if (error || !data?.length) {
      setLoading(false);
      return;
    }
    document.title = `${data[0].bank_name} — Add Invoice`;
    setBankDetail(data[0]);
    setOpinionAmount(String(data[0].bank_opinion_amount));
    setVettingAmount(String(data[0].bank_vetting_amount));
    setModtAmount(String(data[0].bank_modt_amount));
    setLoading(false);
  };

  useEffect(() => { fetchBankDetails(); }, []);

  if (loading) return <LoadingSpinner />;

  const amountInputClass =
    "block w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors";

  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <button
          onClick={handleBack}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="font-bold text-lg text-gray-900 dark:text-white">Add Invoice</h1>
          {bankDetail && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{bankDetail.bank_name}</p>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <form className="max-w-2xl mx-auto p-6 space-y-5" onSubmit={handleSubmit}>
          {/* Client Name */}
          <div className="animate-fade-in" style={{ animationDelay: "0.05s" }}>
            <label className={labelClass}>Client Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={amountInputClass}
              placeholder="Enter client name"
              value={clientName}
              onChange={(e) => { setClientName(e.target.value); setIsDirty(true); }}
            />
          </div>

          {/* Date */}
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <label className={labelClass}>Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              className={amountInputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* File Number */}
          <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <label className={labelClass}>File / Application Number <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={amountInputClass}
              placeholder="File / Application Number"
              value={fileNumber}
              onChange={(e) => setFileNumber(e.target.value)}
            />
          </div>

          {/* Services */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <label className={labelClass}>Services</label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "opinion", label: "Opinion", active: opinion, setActive: setOpinion, setAmount: setOpinionAmount, defaultAmount: bankDetail?.bank_opinion_amount },
                { key: "vetting", label: "Vetting", active: vetting, setActive: setVetting, setAmount: setVettingAmount, defaultAmount: bankDetail?.bank_vetting_amount },
                { key: "modt", label: "MODT", active: modt, setActive: setModt, setAmount: setModtAmount, defaultAmount: bankDetail?.bank_modt_amount },
              ].map(({ key, label, active, setActive, setAmount, defaultAmount }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setActive(!active);
                    !active ? setAmount(String(defaultAmount ?? "")) : setAmount("");
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount fields */}
          {(opinion || vetting || modt) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: "0.25s" }}>
              {opinion && (
                <div>
                  <label className={labelClass}>Opinion Amount</label>
                  <input
                    type="number"
                    className={amountInputClass}
                    placeholder="Amount"
                    value={opinionAmount}
                    min="1"
                    onChange={(e) => setOpinionAmount(e.target.value)}
                  />
                </div>
              )}
              {vetting && (
                <div>
                  <label className={labelClass}>Vetting Amount</label>
                  <input
                    type="number"
                    className={amountInputClass}
                    placeholder="Amount"
                    value={vettingAmount}
                    min="1"
                    onChange={(e) => setVettingAmount(e.target.value)}
                  />
                </div>
              )}
              {modt && (
                <div>
                  <label className={labelClass}>MODT Amount</label>
                  <input
                    type="number"
                    className={amountInputClass}
                    placeholder="Amount"
                    value={modtAmount}
                    min="1"
                    onChange={(e) => setModtAmount(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Total summary */}
          <div
            className="flex items-center justify-between bg-gray-900 dark:bg-gray-800 text-white px-5 py-4 rounded-xl animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <span className="text-sm font-medium text-gray-300">Total Amount</span>
            <span className="text-xl font-bold tabular-nums">₹{totalAmount}/-</span>
          </div>

          {/* Submit */}
          <div className="flex justify-end pb-10 animate-fade-in" style={{ animationDelay: "0.35s" }}>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              {submitting ? "Adding…" : "Add Invoice"}
            </button>
          </div>
        </form>
      </ScrollArea>

      <ToastContainer position="top-right" theme="colored" />
    </div>
  );
}
