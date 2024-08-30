"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/util/supabaseClient";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useDropzone } from "react-dropzone";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { ScrollBar } from "@/components/ui/scroll-area";

export default function AddInvoice({
  params,
}: {
  params: { clientId: string };
}) {
  const [clientName, setClientName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [opinionAmount, setOpinionAmount] = useState("0");
  const [vettingAmount, setVettingAmount] = useState("0");
  const [modtAmount, setModtAmount] = useState("0");
  const [bankDetail, setBankDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigator = useRouter();
  const clientId = params.clientId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ( !opinionAmount || !modtAmount || !vettingAmount) {
      alert("Please fill in all required fields.");
      return;
    }

    if (Number(opinionAmount) <= 0 || isNaN(Number(opinionAmount))) {
      alert("Please enter a valid opinion amount.");
      return;
    }

    if (Number(vettingAmount) <= 0 || isNaN(Number(vettingAmount))) {
      alert("Please enter a valid vetting amount.");
      return;
    }

    if (Number(modtAmount) <= 0 || isNaN(Number(modtAmount))) {
      alert("Please enter a valid MODT amount.");
      return;
    }

    if(!supabase){
        return
    }

    const bank = {
        bank_name: bankDetail.bank_name,
        bank_code: bankDetail.bank_code,
        bank_opinion_amount: opinionAmount,
        bank_vetting_amount: vettingAmount,
        bank_modt_amount: modtAmount,
        bank_logo_url: imageUrl || bankDetail.bank_logo_url, // Update the logo URL if a new one is uploaded
      };

    if(imageFile){

    const exists = await supabase.storage
    .from("banks-clients")
    .exists(imageFile.name)

    console.log(exists)
    if(!exists.data){
    const uploadImage = await supabase.storage
    .from("banks-clients")
    .upload(imageFile.name,imageFile)


    if (uploadImage.error) {
        console.error("Error uploading file:", uploadImage.error);
        alert("There was an error uploading the file. Please try again.");
        return;
      }
    }

    const {data} =await supabase.storage
    .from("banks-clients")
    .getPublicUrl(`${imageFile.name}`);

    if (!data.publicUrl) {
        console.error("Error Fetching file");
        alert("There was an error uploading the file. Please try again.");
        return;
      } 
    
  setImageUrl(data.publicUrl);
  bank.bank_logo_url=data.publicUrl;
    }

    
      if(!supabase){
          return
      }

      
  
      const { data, error } = await supabase
        .from("banks")
        .update(bank)
        .eq("id", bankDetail.id);
  
      if (error) {
        console.error("Error updating bank:", error);
        alert("There was an error updating the bank. Please try again.");
        return;
      }

   
    setClientName("");
    setOpinionAmount(bank.bank_opinion_amount);
    setVettingAmount(bank.bank_vetting_amount);
    setModtAmount(bank.bank_modt_amount);
    setImagePreview(bank.bank_logo_url)
    alert("Bank updated successfully!");
    
    
    
  };

  const fetchBankDetails = async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from("banks")
      .select("*")
      .eq("id", clientId);
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (data) {
      document.title = `${data[0].bank_name} Management`;
      setBankDetail(data[0]);
      setOpinionAmount(data[0].bank_opinion_amount);
      setVettingAmount(data[0].bank_vetting_amount);
      setModtAmount(data[0].bank_modt_amount);
      setImagePreview(data[0].bank_logo_url)
      setLoading(false);
      return data[0];
    }
  };

  const handleDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setImageFile(file);

    // Generate a preview URL for the image
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
  });

  useEffect(() => {
    fetchBankDetails();
    return () => {
      // Revoke the preview URL to avoid memory leaks
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70">
        <div className="flex flex-auto flex-col justify-center items-center p-4 md:p-5">
          <div className="flex justify-center">
            <div
              className="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-black rounded-full dark:text-blue-500"
              role="status"
              aria-label="loading"
            >
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-grow flex-col h-screen min-h-screen overflow-hidden">
      {bankDetail ? (
        <>
          <div className="p-2 flex items-center gap-2 bg-black text-white h-max w-[100%]">
            <ArrowLeftIcon
              className="w-6 h-6 cursor-pointer hover:text-blue-500 ease-linear"
              onClick={() => navigator.back()}
            />
            <h1 className="font-semibold text-2xl">
              Edit Bank - {bankDetail.bank_name}
            </h1>
          </div>
          <ScrollArea className="flex w-full  overflow-x-auto  flex-grow p-4">
            <form
              className="flex flex-col w-full  space-y-4"
              onSubmit={handleSubmit}
            >
              <div className="opacity-0 animate-fade-in delay-[${1 * 100}ms]">
                <label className="block text-sm font-medium text-gray-700">
                  Bank/Client Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter client name"
                  value={bankDetail.bank_name}
                  onChange={(e) => setClientName(e.target.value)}
                  disabled
                />
              </div>

              <div className="opacity-0 animate-fade-in delay-[${3 * 100}ms]">
                <label className="block text-sm font-medium text-gray-700">
                  Bank/Client Logo
                </label>
                <div
                  {...getRootProps()}
                  className={`mt-1 flex items-center justify-center w-full px-3 py-6 border-2 border-dashed rounded-md shadow-sm ${
                    isDragActive
                      ? "border-indigo-500"
                      : "border-gray-300"
                  } focus:outline-none`}
                >
                  <input {...getInputProps()} />
                  {imageFile || imagePreview ? (
                    <div className="text-center">
                      <p className="text-sm text-gray-500">
                        {imageFile ? imageFile.name : "Bank Logo"}
                      </p>
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mt-2 max-h-48"
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Drag and drop an image file here, or click to
                      select one
                    </p>
                  )}
                </div>
              </div>

              <div className="opacity-0 animate-fade-in delay-[${1 * 100}ms]">
                <label className="block text-sm font-medium text-gray-700">
                  Bank/Client Code
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter client code"
                  value={bankDetail.bank_code}
                  disabled
                  onChange={(e) => setBankCode(e.target.value)}
                />
              </div>

              <div className="opacity-0 animate-fade-in delay-[${2 * 100}ms]">
                <label className="block text-sm font-medium text-gray-700">
                  Opinion Amount
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter opinion amount"
                  value={opinionAmount}
                  onChange={(e) => setOpinionAmount(e.target.value)}
                />
              </div>

              <div className="opacity-0 animate-fade-in delay-[${3 * 100}ms]">
                <label className="block text-sm font-medium text-gray-700">
                  Vetting Amount
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter vetting amount"
                  value={vettingAmount}
                  onChange={(e) => setVettingAmount(e.target.value)}
                />
              </div>

              <div className="opacity-0 animate-fade-in delay-[${4 * 100}ms]">
                <label className="block text-sm font-medium text-gray-700">
                  MODT Amount
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter MODT amount"
                  value={modtAmount}
                  onChange={(e) => setModtAmount(e.target.value)}
                />
              </div>

              <div className="flex   justify-end">
                <button
                  type="submit"
                  className="opacity-0 mb-[5rem] md:mb-2 animate-fade-in delay-[${5 * 100}ms] inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Submit
                </button>
              </div>
            </form>
            <ScrollBar orientation="vertical" />
           <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </>
      ) : (
        <div>No bank detail found</div>
      )}
    </div>
  );
}
