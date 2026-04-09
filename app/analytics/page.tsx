"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/util/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { Invoice } from "@/types";
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

function KPICard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex flex-col gap-1 shadow-sm">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn]);

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    // Fetch full year of data
    const start = new Date(currentYear, 0, 1).toISOString();
    const end = new Date(currentYear + 1, 0, 1).toISOString();
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .gt("date", start)
      .lte("date", end)
      .order("date", { ascending: true });
    if (data) setInvoices(data as Invoice[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingSpinner />;

  // ── KPIs ──────────────────────────────────────────────────
  const thisMonthInvoices = invoices.filter((inv) => {
    const d = new Date(inv.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Revenue overview for {currentYear}
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Year-to-date Revenue"
            value={`₹${totalRevenue.toLocaleString("en-IN")}`}
            sub={`${invoices.length} invoices`}
            color="text-indigo-600 dark:text-indigo-400"
          />
          <KPICard
            label={`${MONTHS_SHORT[currentMonth]} Revenue`}
            value={`₹${monthRevenue.toLocaleString("en-IN")}`}
            sub={`${thisMonthInvoices.length} invoices this month`}
            color="text-emerald-600 dark:text-emerald-400"
          />
          <KPICard
            label="Avg per Invoice"
            value={`₹${avgPerInvoice.toLocaleString("en-IN")}`}
            sub="across all invoices"
            color="text-amber-600 dark:text-amber-400"
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
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Monthly Revenue — {currentYear}</h2>
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
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]}
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
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: any, name: any) => [`₹${Number(v).toLocaleString("en-IN")}`, name]}
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
                      formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex-1 space-y-1.5 overflow-hidden">
                  {bankPieData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="truncate text-gray-600 dark:text-gray-300">{entry.name}</span>
                      <span className="ml-auto font-medium text-gray-800 dark:text-gray-200 shrink-0">
                        ₹{entry.value.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Top Clients by Revenue</h2>
          {topClients.length === 0 ? (
            <p className="text-sm text-gray-400">No invoices yet</p>
          ) : (
            <div className="space-y-2">
              {topClients.map((client, i) => {
                const pct = totalRevenue > 0 ? (client.total / totalRevenue) * 100 : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400 w-5 text-right shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{client.name}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white ml-4 shrink-0">
                          ₹{client.total.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 w-14 text-right shrink-0">
                      {client.count} inv.
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
