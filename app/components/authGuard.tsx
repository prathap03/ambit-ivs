"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/util/supabaseClient";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!supabase) {
      router.replace("/login");
      return;
    }
    // getSession() refreshes the token if needed before resolving,
    // so it always reflects the true auth state — no race condition.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthed(true);
      } else {
        router.replace("/login");
      }
      setChecked(true);
    });
  }, []);

  if (!checked || !authed) return null;
  return <>{children}</>;
}
