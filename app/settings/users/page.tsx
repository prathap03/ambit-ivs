"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/util/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { FiTrash2, FiPlus, FiShield, FiUser } from "react-icons/fi";
import { Bank } from "@/types";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: "super_admin" | "user";
}

interface UserAccess {
  bank_id: string;
  role: "admin" | "viewer";
  bank_name?: string;
}

export default function UsersPage() {
  const { isSuperAdmin, isLoggedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userAccess, setUserAccess] = useState<UserAccess[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteRole, setInviteRole] = useState<"super_admin" | "user">("user");
  const [showInvite, setShowInvite] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (isLoggedIn && !isSuperAdmin) { router.push("/"); return; }
    loadData();
  }, [isLoggedIn, isSuperAdmin]);

  const loadData = async () => {
    if (!supabase) return;
    const [{ data: profileData }, { data: bankData }] = await Promise.all([
      supabase.from("profiles").select("*").order("email"),
      supabase.from("banks").select("*").order("bank_name"),
    ]);
    if (profileData) setProfiles(profileData);
    if (bankData) setBanks(bankData);
    setLoading(false);
  };

  const loadUserAccess = async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase
      .from("user_bank_access")
      .select("bank_id, role, banks(bank_name)")
      .eq("user_id", userId);
    if (data) {
      setUserAccess(data.map((row: any) => ({
        bank_id: row.bank_id,
        role: row.role,
        bank_name: row.banks?.bank_name,
      })));
    }
  };

  const selectUser = (p: Profile) => {
    setSelectedUser(p);
    loadUserAccess(p.id);
  };

  const inviteUser = async () => {
    if (!supabase || !inviteEmail || !invitePassword) return;
    setInviting(true);
    const { data, error } = await supabase.auth.admin.createUser({
      email: inviteEmail,
      password: invitePassword,
      email_confirm: true,
      user_metadata: { role: inviteRole },
    });
    if (error) {
      toast.error(error.message);
    } else {
      // update role in profiles
      await supabase.from("profiles").update({ role: inviteRole }).eq("id", data.user.id);
      toast.success(`User ${inviteEmail} created`);
      setInviteEmail("");
      setInvitePassword("");
      setShowInvite(false);
      loadData();
    }
    setInviting(false);
  };

  const grantBankAccess = async (bankId: string, role: "admin" | "viewer") => {
    if (!supabase || !selectedUser) return;
    const { error } = await supabase.from("user_bank_access").upsert({
      user_id: selectedUser.id,
      bank_id: bankId,
      role,
    }, { onConflict: "user_id,bank_id" });
    if (error) toast.error(error.message);
    else { toast.success("Access updated"); loadUserAccess(selectedUser.id); }
  };

  const revokeAccess = async (bankId: string) => {
    if (!supabase || !selectedUser) return;
    const { error } = await supabase
      .from("user_bank_access")
      .delete()
      .eq("user_id", selectedUser.id)
      .eq("bank_id", bankId);
    if (error) toast.error(error.message);
    else { toast.success("Access revoked"); loadUserAccess(selectedUser.id); }
  };

  const updateGlobalRole = async (userId: string, role: "super_admin" | "user") => {
    if (!supabase) return;
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
    if (error) toast.error(error.message);
    else { toast.success("Role updated"); loadData(); }
  };

  if (loading) return <LoadingSpinner />;

  const accessedBankIds = new Set(userAccess.map((a) => a.bank_id));

  return (
    <main className="flex h-full w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col md:flex-row w-full h-full overflow-hidden">
        {/* Left: user list */}
        <div className="w-full md:w-72 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Users ({profiles.length})</h2>
            <button
              onClick={() => setShowInvite(!showInvite)}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              <FiPlus size={14} className="text-white" />
            </button>
          </div>

          {/* Invite form */}
          {showInvite && (
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Create User</p>
              <input
                type="email"
                placeholder="Email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="user">User</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <button
                onClick={inviteUser}
                disabled={inviting}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {inviting ? "Creating…" : "Create User"}
              </button>
            </div>
          )}

          {/* User list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => selectUser(p)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  selectedUser?.id === p.id ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  p.role === "super_admin" ? "bg-indigo-100 dark:bg-indigo-900/50" : "bg-gray-100 dark:bg-gray-800"
                }`}>
                  {p.role === "super_admin"
                    ? <FiShield size={14} className="text-indigo-600 dark:text-indigo-400" />
                    : <FiUser size={14} className="text-gray-500 dark:text-gray-400" />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {p.full_name || p.email}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{p.email}</p>
                </div>
                <span className={`ml-auto shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  p.role === "super_admin"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                  {p.role === "super_admin" ? "Admin" : "User"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: user detail */}
        <div className="flex-1 overflow-y-auto">
          {!selectedUser ? (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600 text-sm">
              Select a user to manage their access
            </div>
          ) : (
            <div className="p-6 space-y-6 max-w-2xl">
              {/* User header */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedUser.full_name || selectedUser.email}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Global role:</span>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => updateGlobalRole(selectedUser.id, e.target.value as any)}
                    className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="user">User</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>

              {/* Bank access */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Bank Access</h3>
                {selectedUser.role === "super_admin" ? (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 text-sm text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                    <FiShield size={16} />
                    Super admins have access to all banks automatically.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {banks.map((bank) => {
                      const access = userAccess.find((a) => a.bank_id === bank.id);
                      return (
                        <div
                          key={bank.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${access ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{bank.bank_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={access?.role ?? ""}
                              onChange={(e) => {
                                if (e.target.value) grantBankAccess(bank.id, e.target.value as any);
                              }}
                              className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="">No access</option>
                              <option value="viewer">Viewer</option>
                              <option value="admin">Admin</option>
                            </select>
                            {access && (
                              <button
                                onClick={() => revokeAccess(bank.id)}
                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                <FiTrash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="bottom-right" theme="colored" />
    </main>
  );
}
