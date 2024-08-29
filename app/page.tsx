"use client";

import YearMonthPicker from "@/components/ui/year-month-picker";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Use this instead of Radix UI's ScrollArea
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CardList from "./components/cardList";
import { useAuth } from "../context/AuthContext";
import { supabase } from "@/util/supabaseClient";

export default function Home() {
  const navigator = useRouter();
  const { isLoggedIn } = useAuth();
  const searchParams = useSearchParams();
  const clientName = searchParams.get("clientName");
  const [banks, setBanks] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  
  const fetchBanks = useCallback(async () => {
    try {
     if(!supabase){
        return
     }
     const { data, error } =await supabase.from('banks').select('*').order('bank_name', {ascending: true});
     if(!data){
        setLoading(false);
        return
     }

      setBanks(data);
      
    } catch (error) {
      console.error("Error fetching banks:", error);
      setLoading(false);
    } 
    setLoading(false);
  },[supabase]);
  

  useEffect(() => {
    setLoading(true);
    fetchBanks();
    if (!supabase) return;

    // Setting up real-time subscription
    const channel = supabase
      .channel("bank-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "banks" },

        fetchBanks
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "banks" },
        fetchBanks
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "banks" },
        (payload) => {
          setBanks((prev:any) => {
            const updatedData = prev.map((bank:any) =>
              bank.id === payload.new.id
                ? { ...banks, ...payload.new }
                : bank
            );
     
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
  }, [fetchBanks]);

  useEffect(() => {
    setLoading(true);
    if (!isLoggedIn) {
      navigator.push("/login");
    }
    
  }, [isLoggedIn]);

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
    <main className="flex max-h-screen flex-col items-center justify-between dark:bg-black p-5 md:overflow-hidden">
      <div className="flex outline-1 outline rounded-md shadow-md flex-grow h-screen w-full ">
        <ScrollArea className="w-full  !h-[calc(100vh_-_145px)]">
          <CardList banks={banks} />
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </main>
  );
}
