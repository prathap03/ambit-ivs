"use client";

import YearMonthPicker from "@/components/ui/year-month-picker";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Use this instead of Radix UI's ScrollArea
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CardList from "./components/cardList";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigator = useRouter();
  const { isLoggedIn } = useAuth();
  const searchParams = useSearchParams();
  const clientName = searchParams.get("clientName");

  useEffect(() => {
    if (clientName) {
      document.title = `${clientName} Management`;
    }
  }, [clientName]);

  useEffect(() => {
    console.log("Is Logged In:", isLoggedIn);
    if (!isLoggedIn) {
      navigator.push("/login");
    }
  }, [isLoggedIn, navigator]);

  return (
    <main className="flex max-h-screen flex-col items-center justify-between dark:bg-black p-5 md:overflow-hidden">
      <div className="flex outline-1 outline rounded-md shadow-md flex-grow h-screen w-full ">
        <ScrollArea className="w-full  !h-[calc(100vh_-_145px)]">
          <CardList />
          <ScrollBar orientation="vertical" />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </main>
  );
}
