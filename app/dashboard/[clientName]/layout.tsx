// app/home/_layout.tsx
import React, { Suspense } from "react";
import Navbar from "./components/navbar";
// import Navbar from "@/components/homeComponent/navbar";


export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <div className="MonaSans  w-[100vw] min-h-[100vh] h-[100vh] flex base:flex-col bl:flex-row items-center base:bg-white bl:bg-[#fbfbfb] overflow-hidden">
      <Navbar />
      <main className="base:w-full flex-grow bl:w-auto bl:flex-1  bl:pt-[10px] base:h-full border-l-[1.8px] overflow-hidden ">
      <Suspense fallback={null}>
           
        {children}
        </Suspense>
      </main>
    </div>
  );
}

/// navbar active color f4f4f5

// import React from 'react';
// import Navbar from '@/components/homeComponent/navbar';

// export default function HomeLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className='MonaSans w-[100vw] min-h-[100vh] h-[100vh] flex base:flex-col bl:flex-row justify-center items-center base:bg-white bl:bg-[#f7f8fc] overflow-hidden'>
//       <Navbar />
//       <main className='bg-[#FFFFFF] base:w-full bl:w-[82%] bl:mt-[3vh] base:h-full bl:h-[97vh] bl:rounded-l-[20px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] overflow-hidden'>
//         {children}
//       </main>
//     </div>
//   );
// }
