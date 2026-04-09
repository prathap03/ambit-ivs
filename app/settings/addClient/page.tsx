"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/util/supabaseClient";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useDropzone } from "react-dropzone";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { ScrollBar } from "@/components/ui/scroll-area";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddClient() {
  const [clientName, setClientName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [opinionAmount, setOpinionAmount] = useState("0");
  const [vettingAmount, setVettingAmount] = useState("0");
  const [modtAmount, setModtAmount] = useState("0");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>("/images/default.png");
  const [submitting, setSubmitting] = useState(false);
  const navigator = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName || !bankCode || !opinionAmount || !modtAmount || !vettingAmount) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (Number(opinionAmount) <= 0 || isNaN(Number(opinionAmount))) {
      toast.error("Please enter a valid opinion amount.");
      return;
    }
    if (Number(vettingAmount) <= 0 || isNaN(Number(vettingAmount))) {
      toast.error("Please enter a valid vetting amount.");
      return;
    }
    if (Number(modtAmount) <= 0 || isNaN(Number(modtAmount))) {
      toast.error("Please enter a valid MODT amount.");
      return;
    }
    if (!supabase) return;

    setSubmitting(true);

    const bank = {
      bank_name: clientName,
      bank_code: bankCode,
      bank_opinion_amount: opinionAmount,
      bank_vetting_amount: vettingAmount,
      bank_modt_amount: modtAmount,
      bank_logo_url: "/images/default.png",
    };

    if (imageFile) {
      const exists = await supabase.storage.from("banks-clients").exists(imageFile.name);
      if (!exists.data) {
        const { error: uploadError } = await supabase.storage.from("banks-clients").upload(imageFile.name, imageFile);
        if (uploadError) {
          toast.error("There was an error uploading the file. Please try again.");
          setSubmitting(false);
          return;
        }
      }
      const { data } = await supabase.storage.from("banks-clients").getPublicUrl(imageFile.name);
      if (!data.publicUrl) {
        toast.error("There was an error uploading the file. Please try again.");
        setSubmitting(false);
        return;
      }
      bank.bank_logo_url = data.publicUrl;
    } else {
      bank.bank_logo_url = "/images/default.png";
    }

    const { error } = await supabase.from("banks").insert(bank);
    setSubmitting(false);

    if (error) {
      toast.error("There was an error creating the bank. Please try again.");
      return;
    }

    toast.success("Bank created successfully!");
    setTimeout(() => navigator.back(), 800);
  };

  const handleDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  return (
    <div className="flex flex-grow flex-col h-screen min-h-screen overflow-hidden">
      <div className="p-2 flex items-center gap-2 bg-black text-white h-max w-full">
        <ArrowLeftIcon
          className="w-6 h-6 cursor-pointer hover:text-blue-500 ease-linear"
          onClick={() => navigator.back()}
        />
        <h1 className="font-semibold text-2xl">Add Bank/Client</h1>
      </div>
      <ScrollArea className="flex w-full overflow-x-auto flex-grow p-4">
        <form className="flex flex-col w-full space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank/Client Name</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-900 dark:text-gray-100"
              placeholder="Enter client name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank/Client Logo</label>
            <div
              {...getRootProps()}
              className={`mt-1 flex items-center justify-center w-full px-3 py-6 border-2 border-dashed rounded-md shadow-sm ${isDragActive ? "border-indigo-500" : "border-gray-300 dark:border-gray-700"} focus:outline-none`}
            >
              <input {...getInputProps()} />
              {imagePreview ? (
                <div className="text-center">
                  <p className="text-sm text-gray-500">{imageFile ? imageFile.name : "Bank Logo"}</p>
                  <img src={imagePreview} alt="Preview" className="mt-2 max-h-48" />
                </div>
              ) : (
                <p className="text-sm text-gray-500">Drag and drop an image file here, or click to select one</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank/Client Code</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-900 dark:text-gray-100"
              placeholder="Enter client code"
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opinion Amount</label>
            <input
              type="number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-900 dark:text-gray-100"
              placeholder="Enter opinion amount"
              value={opinionAmount}
              onChange={(e) => setOpinionAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vetting Amount</label>
            <input
              type="number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-900 dark:text-gray-100"
              placeholder="Enter vetting amount"
              value={vettingAmount}
              onChange={(e) => setVettingAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">MODT Amount</label>
            <input
              type="number"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-900 dark:text-gray-100"
              placeholder="Enter MODT amount"
              value={modtAmount}
              onChange={(e) => setModtAmount(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="mb-[5rem] md:mb-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {submitting ? "Creating…" : "Submit"}
            </button>
          </div>
        </form>
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <ToastContainer position="top-right" theme="colored" />
    </div>
  );
}
