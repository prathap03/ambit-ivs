import React, { Suspense } from "react";
import AuthGuard from "../../components/authGuard";

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="h-full flex flex-col overflow-hidden">
        <Suspense fallback={null}>{children}</Suspense>
      </div>
    </AuthGuard>
  );
}
