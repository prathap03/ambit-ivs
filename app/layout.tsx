import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "next-themes";
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthProvider>
            <main className="MonaSans w-screen h-screen flex base:flex-col bl:flex-row base:bg-white dark:bg-gray-950 bl:bg-[#f8f9fa] dark:bl:bg-gray-950 overflow-hidden">
              <Navbar />
              <div className="flex-1 min-w-0 h-full bl:border-l bl:border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
                <Suspense fallback={null} >
                  <div className="flex-1 h-full overflow-hidden">
                    {children}
                  </div>
                </Suspense>
              </div>
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
