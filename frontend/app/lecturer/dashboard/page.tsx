"use client";

import { useMemo } from "react";
import { BookOpen, Users, Award, AlertTriangle, RefreshCw, Minus, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useCurrentUserQuery, useGetAdminAnalyticsQuery } from "@/lib/redux/slices/AuthSlice";

interface StatCard {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    value: string | number;
    label: string;
    trend: "up" | "down" | "stable";
    trendValue: string;
}

interface Module {
    code: string;
    name: string;
    students: number;
    classAvg: number;
    passRate: number;
}

const modules: Module[] = [
    { code: "CS301", name: "Algorithms & Data Structures", students: 38, classAvg: 74, passRate: 76 },
    { code: "CS302", name: "Database Systems", students: 42, classAvg: 80, passRate: 82 },
    { code: "CS401", name: "Advanced Algorithms", students: 31, classAvg: 67, passRate: 69 },
    { code: "CS450", name: "Machine Learning Fundamentals", students: 31, classAvg: 83, passRate: 85 },
];

function TrendBadge({ trend, value }: { trend: StatCard["trend"]; value: string }) {
    if (trend === "stable") return <span className="flex items-center gap-1 text-xs font-medium text-gray-400"><Minus size={12} />{value}</span>;
    return trend === "up" ? <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500"><TrendingUp size={13} />{value}</span> : <span className="flex items-center gap-1 text-xs font-semibold text-red-400"><TrendingDown size={13} />{value}</span>;
}

function StatCardView({ card }: { card: StatCard }) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: card.iconBg, color: card.iconColor }}>
                    {card.icon}
                </div>
                <TrendBadge trend={card.trend} value={card.trendValue} />
            </div>
            <div>
                <p className="text-3xl font-bold text-gray-900 leading-none">{card.value}</p>
                <p className="mt-1.5 text-sm text-gray-400 font-medium">{card.label}</p>
            </div>
        </div>
    );
}

function ModuleRow({ mod }: { mod: Module }) {
    return (
        <div className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <BookOpen size={16} className="text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{mod.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{mod.code} - {mod.students} students</p>
            </div>
            <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-800">{mod.passRate}%</p>
                <p className="text-xs text-gray-400">class avg</p>
            </div>
        </div>
    );
}

export default function LecturerDashboard() {
    const { data: me } = useCurrentUserQuery(undefined, { skip: typeof window === "undefined" });
    const { data: analytics, refetch } = useGetAdminAnalyticsQuery();
    const stats: StatCard[] = useMemo(
        () => [
            {
                icon: <BookOpen size={18} className="text-emerald-500" />,
                iconBg: "#f0fdf4",
                iconColor: "#10b981",
                value: modules.length,
                label: "Modules Teaching",
                trend: "stable",
                trendValue: "Stable",
            },
            {
                icon: <Users size={18} className="text-indigo-500" />,
                iconBg: "#eef2ff",
                iconColor: "#6366f1",
                value: analytics?.students?.total ?? 0,
                label: "Total Students",
                trend: "up",
                trendValue: "+Live",
            },
            {
                icon: <Award size={18} className="text-violet-500" />,
                iconBg: "#f5f3ff",
                iconColor: "#8b5cf6",
                value: analytics?.students?.average_performance ? `${analytics.students.average_performance}` : "3.2",
                label: "Class Avg GPA",
                trend: "up",
                trendValue: "+Live",
            },
            {
                icon: <AlertTriangle size={18} className="text-amber-500" />,
                iconBg: "#fffbeb",
                iconColor: "#f59e0b",
                value: analytics?.students?.at_risk ?? 0,
                label: "At-Risk Students",
                trend: "down",
                trendValue: "-Live",
            },
        ],
        [analytics]
    );

    const chartData = modules.map((m) => ({ name: m.code, "Class Average": m.classAvg, "Pass Rate %": m.passRate }));

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hello, {me?.username ?? "Lecturer"}</h1>
                    <p className="mt-1 text-sm text-gray-500">Lecturer Dashboard - Live academic overview</p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                >
                    <RefreshCw size={15} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
                {stats.map((card) => <StatCardView key={card.label} card={card} />)}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <h2 className="text-base font-bold text-gray-900 mb-6">Module Performance Overview</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%" barGap={4}>
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
                            <Bar dataKey="Class Average" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={36} />
                            <Bar dataKey="Pass Rate %" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={36} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <h2 className="text-base font-bold text-gray-900 mb-4">My Modules</h2>
                    <div className="divide-y divide-gray-50">
                        {modules.map((mod) => <ModuleRow key={mod.code} mod={mod} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}
