"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/util/supabaseClient";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { Invoice } from "@/types";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const COLORS = ["#6366f1","#10b981","#f59e0b","#3b82f6","#ec4899","#14b8a6","#f97316","#8b5cf6"];

function maskValue(value: string) {
  return value.replace(/[0-9]/g, "•");
}

function KPICard({ label, value, sub, color, revealed }: { label: string; value: string; sub?: string; color: string; revealed?: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex flex-col gap-1 shadow-sm overflow-hidden">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p key={revealed ? "shown" : "hidden"} className={`text-2xl font-bold ${color} ${revealed ? "animate-reveal" : ""}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
    </div>
  );
}

function RevealModal({ onCancel, onSubmit, error, submitting }: { onCancel: () => void; onSubmit: (password: string) => void; error: string; submitting: boolean }) {
  const [password, setPassword] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-sm">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Confirm password</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enter your password to reveal amounts.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(password);
          }}
        >
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mt-3">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2 text-sm rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !password}
              className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg shadow-sm transition-colors"
            >
              {submitting ? "Verifying…" : "Reveal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [hideAmounts, setHideAmounts] = useState(true);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [revealError, setRevealError] = useState("");
  const [revealing, setRevealing] = useState(false);
  const currentMonth = new Date().getMonth();
  const yearOptions = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const handleReveal = useCallback(async (password: string) => {
    if (!supabase) return;
    setRevealing(true);
    setRevealError("");
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;
    if (!email) {
      setRevealError("Could not verify current user.");
      setRevealing(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setRevealing(false);
    if (error) {
      setRevealError("Incorrect password.");
      return;
    }
    setHideAmounts(false);
    setShowRevealModal(false);
  }, []);

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const start = new Date(selectedYear, 0, 1).toISOString();
    const end = new Date(selectedYear + 1, 0, 1).toISOString();
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .gt("date", start)
      .lte("date", end)
      .order("date", { ascending: true });
    if (data) setInvoices(data as Invoice[]);
    setLoading(false);
  }, [selectedYear]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingSpinner />;

  // ── KPIs ──────────────────────────────────────────────────
  const thisMonthInvoices = invoices.filter((inv) => {
    const d = new Date(inv.date);
    return d.getMonth() === currentMonth && d.getFullYear() === selectedYear;
  });
  const totalRevenue = invoices.reduce((s, inv) => s + inv.total_amount, 0);
  const monthRevenue = thisMonthInvoices.reduce((s, inv) => s + inv.total_amount, 0);
  const avgPerInvoice = invoices.length ? Math.round(totalRevenue / invoices.length) : 0;

  // ── Monthly trend (area chart) ─────────────────────────────
  const monthlyData = MONTHS_SHORT.map((month, i) => {
    const monthInvs = invoices.filter((inv) => new Date(inv.date).getMonth() === i);
    return {
      month,
      Revenue: monthInvs.reduce((s, inv) => s + inv.total_amount, 0),
      Invoices: monthInvs.length,
    };
  });

  // ── Service breakdown per month (stacked bar) ─────────────
  const serviceData = MONTHS_SHORT.map((month, i) => {
    const mi = invoices.filter((inv) => new Date(inv.date).getMonth() === i);
    return {
      month,
      Opinion: mi.filter((inv) => inv.opinion).reduce((s, inv) => s + (inv.opinion_amount ?? 0), 0),
      Vetting: mi.filter((inv) => inv.vetting).reduce((s, inv) => s + (inv.vetting_amount ?? 0), 0),
      MODT: mi.filter((inv) => inv.modt).reduce((s, inv) => s + (inv.modt_amount ?? 0), 0),
    };
  });

  // ── Earnings by bank (pie) ────────────────────────────────
  const bankMap: Record<string, number> = {};
  invoices.forEach((inv) => {
    const key = inv.bank_company_name || "Unknown";
    bankMap[key] = (bankMap[key] ?? 0) + inv.total_amount;
  });
  const bankPieData = Object.entries(bankMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // ── Top clients ───────────────────────────────────────────
  const clientMap: Record<string, { total: number; count: number }> = {};
  invoices.forEach((inv) => {
    if (!clientMap[inv.client_name]) clientMap[inv.client_name] = { total: 0, count: 0 };
    clientMap[inv.client_name].total += inv.total_amount;
    clientMap[inv.client_name].count += 1;
  });
  const topClients = Object.entries(clientMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([name, { total, count }]) => ({ name, total, count }));

  const tooltipStyle = {
    backgroundColor: "var(--tooltip-bg, #1f2937)",
    border: "1px solid #374151",
    borderRadius: "8px",
    color: "#f9fafb",
    fontSize: "12px",
  };

  return (
    <main className="flex flex-col h-full w-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="p-5 space-y-6 max-w-7xl mx-auto w-full pb-10">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Revenue overview for {selectedYear}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (hideAmounts) {
                  setRevealError("");
                  setShowRevealModal(true);
                } else {
                  setHideAmounts(true);
                }
              }}
              title={hideAmounts ? "Show amounts" : "Hide amounts"}
              aria-label={hideAmounts ? "Show amounts" : "Hide amounts"}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {hideAmounts ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Year-to-date Revenue"
            value={hideAmounts ? maskValue(`₹${totalRevenue.toLocaleString("en-IN")}`) : `₹${totalRevenue.toLocaleString("en-IN")}`}
            sub={`${invoices.length} invoices`}
            color="text-indigo-600 dark:text-indigo-400"
            revealed={!hideAmounts}
          />
          <KPICard
            label={`${MONTHS_SHORT[currentMonth]} Revenue`}
            value={hideAmounts ? maskValue(`₹${monthRevenue.toLocaleString("en-IN")}`) : `₹${monthRevenue.toLocaleString("en-IN")}`}
            sub={`${thisMonthInvoices.length} invoices this month`}
            color="text-emerald-600 dark:text-emerald-400"
            revealed={!hideAmounts}
          />
          <KPICard
            label="Avg per Invoice"
            value={hideAmounts ? maskValue(`₹${avgPerInvoice.toLocaleString("en-IN")}`) : `₹${avgPerInvoice.toLocaleString("en-IN")}`}
            sub="across all invoices"
            color="text-amber-600 dark:text-amber-400"
            revealed={!hideAmounts}
          />
          <KPICard
            label="Active Banks"
            value={`${bankPieData.length}`}
            sub="banks with invoices"
            color="text-blue-600 dark:text-blue-400"
          />
        </div>

        {/* Monthly Revenue Trend */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Monthly Revenue — {selectedYear}</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => hideAmounts ? "••" : `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: any) => [hideAmounts ? maskValue(`₹${Number(v).toLocaleString("en-IN")}`) : `₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service Breakdown + Bank Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Service breakdown stacked bar */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Service Breakdown by Month</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={serviceData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => hideAmounts ? "••" : `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: any, name: any) => [hideAmounts ? maskValue(`₹${Number(v).toLocaleString("en-IN")}`) : `₹${Number(v).toLocaleString("en-IN")}`, name]}
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Opinion" stackId="a" fill="#6366f1" radius={[0,0,0,0]} />
                <Bar dataKey="Vetting" stackId="a" fill="#10b981" radius={[0,0,0,0]} />
                <Bar dataKey="MODT" stackId="a" fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Earnings by bank pie */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Revenue by Bank</h2>
            {bankPieData.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">No data</div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie
                      data={bankPieData}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {bankPieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v: any) => [hideAmounts ? maskValue(`₹${Number(v).toLocaleString("en-IN")}`) : `₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex-1 space-y-1.5 overflow-hidden">
                  {bankPieData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="truncate text-gray-600 dark:text-gray-300">{entry.name}</span>
                      <span
                        key={hideAmounts ? "hidden" : "shown"}
                        className={`ml-auto font-medium text-gray-800 dark:text-gray-200 shrink-0 ${!hideAmounts ? "animate-reveal" : ""}`}
                      >
                        {hideAmounts ? maskValue(`₹${entry.value.toLocaleString("en-IN")}`) : `₹${entry.value.toLocaleString("en-IN")}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>


      </div>
      {showRevealModal && (
        <RevealModal
          onCancel={() => setShowRevealModal(false)}
          onSubmit={handleReveal}
          error={revealError}
          submitting={revealing}
        />
      )}
    </main>
  );
}
