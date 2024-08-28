import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { useSearchParams } from "next/navigation";
import Navbar from "./components/navbar";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: `Invoice management`,
  description: "Innovative solutions for your paralegal invoices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <div className="MonaSans  w-[100vw] min-h-[100vh] h-[100vh] flex base:flex-col bl:flex-row items-center base:bg-white bl:bg-[#fbfbfb] overflow-hidden">
      <Navbar />
      <main className="base:w-full flex-grow bl:w-auto bl:flex-1  bl:pt-[10px] base:h-full border-l-[1.8px] overflow-hidden ">
      <Suspense fallback={null}>
           
        {children}
        </Suspense>
      </main>
    </div>

      </body>
    </html>
  );
}
