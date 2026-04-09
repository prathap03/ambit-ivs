import React, { Suspense } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Suspense fallback={null}>{children}</Suspense>
    </div>
  );
}
