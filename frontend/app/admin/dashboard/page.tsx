"use client";

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { AlertTriangle, MessageSquare, UserCheck, Users, RefreshCw } from "lucide-react";
import { useGetAdminAnalyticsQuery } from "@/lib/redux/slices/AuthSlice";

const FALLBACK_GROWTH = [
    { month: "Jan", students: 320, staff: 80 },
    { month: "Feb", students: 380, staff: 85 },
    { month: "Mar", students: 430, staff: 92 },
    { month: "Apr", students: 500, staff: 98 },
    { month: "May", students: 570, staff: 105 },
    { month: "Jun", students: 640, staff: 114 },
];

const FALLBACK_ACTIVITY = [
    { day: "Mon", sessions: 130 },
    { day: "Tue", sessions: 185 },
    { day: "Wed", sessions: 225 },
    { day: "Thu", sessions: 190 },
    { day: "Fri", sessions: 150 },
    { day: "Sat", sessions: 65 },
    { day: "Sun", sessions: 45 },
];

export default function Dashboard() {
    const { data, isLoading, refetch } = useGetAdminAnalyticsQuery();
    const users = data?.users;
    const students = data?.students;
    const chatbot = data?.chatbot;
    const recentLogs = data?.audit?.recent_logs ?? [];
    const recentChats = chatbot?.recent_sessions ?? [];

    const stats = [
        {
            label: "Total Users",
            value: users ? users.total.toString() : "--",
            sub: users ? `${users.active} active accounts` : "Live platform total",
            change: users ? `${users.active > 0 ? "+" : ""}${Math.round((users.active / Math.max(users.total, 1)) * 100)}%` : "Live",
            changeColor: "text-emerald-500",
            iconBg: "bg-slate-100",
            iconColor: "text-slate-600",
            icon: Users,
        },
        {
            label: "Active Students",
            value: students ? students.total.toString() : "--",
            sub: students ? `${students.at_risk} flagged at-risk` : "Live student profile count",
            change: students ? `${students.at_risk > 0 ? "-" : "+"}${students.at_risk}` : "Live",
            changeColor: "text-emerald-500",
            iconBg: "bg-violet-100",
            iconColor: "text-violet-600",
            icon: UserCheck,
        },
        {
            label: "AI Chat Sessions",
            value: chatbot ? chatbot.total_conversations.toString() : "--",
            sub: "Conversation history stored",
            change: recentChats.length ? `+${recentChats.length}` : "Live",
            changeColor: "text-emerald-500",
            iconBg: "bg-cyan-100",
            iconColor: "text-cyan-600",
            icon: MessageSquare,
        },
        {
            label: "At-Risk Students",
            value: students ? students.at_risk.toString() : "--",
            sub: students ? `Average performance ${students.average_performance}` : "Needs attention",
            change: students && students.at_risk > 0 ? "Review" : "OK",
            changeColor: students && students.at_risk > 0 ? "text-red-500" : "text-emerald-500",
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            icon: AlertTriangle,
        },
    ];

    const riskData = [
        { name: "On Track", value: Math.max((students?.total ?? 0) - (students?.at_risk ?? 0), 0), color: "#22c55e" },
        { name: "At Risk", value: students?.at_risk ?? 0, color: "#f59e0b" },
        { name: "Critical", value: Math.max(Math.floor((students?.at_risk ?? 0) / 3), 0), color: "#ef4444" },
    ];

    const events = [
        ...(recentLogs.slice(0, 3).map((entry: any) => ({
            text: `${entry.action.replaceAll("_", " ").toLowerCase()} by ${entry.user ?? "system"}`,
            time: new Date(entry.timestamp).toLocaleString(),
            dotColor: "bg-blue-500",
        }))),
        ...(recentChats.slice(0, 1).map((chat: any) => ({
            text: `Recent chatbot session with ${chat.user}`,
            time: new Date(chat.created_at).toLocaleString(),
            dotColor: "bg-emerald-500",
        }))),
    ];

    return (
        <div className="space-y-6 bg-slate-50 p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">System Overview</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Live platform summary powered by the backend analytics and audit stream
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                    <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map(({ label, value, sub, change, changeColor, iconBg, iconColor, icon: Icon }) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
                                <Icon size={18} />
                            </div>
                            <span className={`text-sm font-semibold ${changeColor}`}>{change}</span>
                        </div>
                        <p className="mt-4 text-2xl font-extrabold text-slate-900">{value}</p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-700">{label}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                    <h3 className="text-base font-bold text-slate-900">User Growth</h3>
                    <p className="mt-0.5 text-sm text-slate-400">Students and staff over 6 months</p>
                    <div className="mt-4 h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={FALLBACK_GROWTH} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="studentsFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Area type="monotone" dataKey="students" stroke="#7c3aed" strokeWidth={2.5} fill="url(#studentsFill)" />
                                <Area type="monotone" dataKey="staff" stroke="#a855f7" strokeWidth={2} fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="text-base font-bold text-slate-900">Student Risk Status</h3>
                    <div className="mt-4 flex h-56 items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={riskData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={3} startAngle={90} endAngle={-270}>
                                    {riskData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2.5">
                        {riskData.map(({ name, value, color }) => (
                            <div key={name} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2 text-slate-600">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                                    {name}
                                </span>
                                <span className="font-bold text-slate-900">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="text-base font-bold text-slate-900">Daily System Activity</h3>
                    <p className="mt-0.5 text-sm text-slate-400">Chat sessions per day</p>
                    <div className="mt-4 h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={FALLBACK_ACTIVITY} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Bar dataKey="sessions" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h3 className="text-base font-bold text-slate-900">Recent System Events</h3>
                    <div className="mt-4 divide-y divide-slate-100">
                        {events.map(({ text, time, dotColor }) => (
                            <div key={`${text}-${time}`} className="flex items-center justify-between py-3.5">
                                <span className="flex items-center gap-3 text-sm font-medium text-slate-700">
                                    <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
                                    {text}
                                </span>
                                <span className="shrink-0 text-xs text-slate-400">{time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
