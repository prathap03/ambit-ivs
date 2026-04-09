"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/util/supabaseClient";
import type { User } from "@supabase/supabase-js";

export type UserRole = "super_admin" | "user";

export interface BankAccess {
  bank_id: string;
  role: "admin" | "viewer";
}

export interface AuthContextType {
  user: User | null;
  profile: { id: string; email: string; full_name: string; role: UserRole } | null;
  bankAccess: BankAccess[];
  isLoggedIn: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  canWriteBank: (bankId: string) => boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [bankAccess, setBankAccess] = useState<BankAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", userId)
      .single();
    if (data) setProfile(data);
  };

  const fetchBankAccess = async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from("user_bank_access")
      .select("bank_id, role")
      .eq("user_id", userId);
    if (data) setBankAccess(data);
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // onAuthStateChange fires INITIAL_SESSION immediately in Supabase v2,
    // so it's the single source of truth for both auth state and loading.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
        fetchBankAccess(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setBankAccess([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return "Supabase not configured";
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    router.push("/");
    return null;
  };

  const logout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isSuperAdmin = profile?.role === "super_admin";

  const canWriteBank = (bankId: string) => {
    if (isSuperAdmin) return true;
    return bankAccess.some((a) => a.bank_id === bankId && a.role === "admin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        bankAccess,
        isLoggedIn: !!user,
        isSuperAdmin,
        loading,
        canWriteBank,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
