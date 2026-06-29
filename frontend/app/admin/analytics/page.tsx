"use client";

import React from "react";
import {
    Activity,
    Zap,
    Brain,
    MessageSquare,
    ArrowUpRight,
} from "lucide-react";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

interface StatCard {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    change: string;
    value: string;
    label: string;
    sublabel?: string;
}

interface SessionDay {
    day: string;
    value: number;
}

interface ModuleUsage {
    name: string;
    percent: number;
    barColor: string;
}

interface ServiceStatus {
    name: string;
    status: string;
    latency: string;
}

// ----------------------------------------------------------------------------
// Static data — swap these out for real data from your API/DB
// ----------------------------------------------------------------------------

const STATS: StatCard[] = [
    {
        icon: <Activity className="h-5 w-5" />,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-500",
        change: "+4.2%",
        value: "99.97%",
        label: "Uptime",
    },
    {
        icon: <Zap className="h-5 w-5" />,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        change: "+4.2%",
        value: "1.8s",
        label: "Avg Response",
        sublabel: "Target: <3s",
    },
    {
        icon: <Brain className="h-5 w-5" />,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-500",
        change: "+4.2%",
        value: "94.2%",
        label: "AI Accuracy",
    },
    {
        icon: <MessageSquare className="h-5 w-5" />,
        iconBg: "bg-cyan-50",
        iconColor: "text-cyan-500",
        change: "+4.2%",
        value: "18,432",
        label: "Total Chats",
    },
];

const SESSION_VOLUME: SessionDay[] = [
    { day: "Mon", value: 145 },
    { day: "Tue", value: 190 },
    { day: "Wed", value: 225 },
    { day: "Thu", value: 195 },
    { day: "Fri", value: 160 },
    { day: "Sat", value: 80 },
    { day: "Sun", value: 55 },
];

const MODULE_USAGE: ModuleUsage[] = [
    { name: "AI Chatbot", percent: 68, barColor: "bg-purple-500" },
    { name: "Course Recommender", percent: 52, barColor: "bg-blue-900" },
    { name: "Career Guide", percent: 43, barColor: "bg-cyan-500" },
    { name: "Performance Analyser", percent: 37, barColor: "bg-emerald-500" },
];

const SERVICES: ServiceStatus[] = [
    { name: "NLP Engine", status: "Operational", latency: "120ms" },
    { name: "Recommendation API", status: "Operational", latency: "245ms" },
    { name: "Database", status: "Operational", latency: "18ms" },
    { name: "Auth Service", status: "Operational", latency: "45ms" },
];

const Y_AXIS_TICKS = [240, 180, 120, 60, 0];
const CHART_MAX = 240;

// ----------------------------------------------------------------------------
// Small presentational components
// ----------------------------------------------------------------------------

function StatCardItem({ stat }: { stat: StatCard }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}
                >
                    {stat.icon}
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-emerald-500">
                    <ArrowUpRight className="h-4 w-4" />
                    {stat.change}
                </div>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
            <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
            {stat.sublabel && (
                <div className="text-xs text-gray-400">{stat.sublabel}</div>
            )}
        </div>
    );
}

function WeeklySessionVolumeChart({ data }: { data: SessionDay[] }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-base font-semibold text-gray-900">
                Weekly Session Volume
            </h2>

            <div className="flex">
                {/* Y axis */}
                <div className="mr-3 flex flex-col justify-between text-xs text-gray-400">
                    {Y_AXIS_TICKS.map((tick) => (
                        <span key={tick} className="leading-none">
                            {tick}
                        </span>
                    ))}
                </div>

                {/* Bars */}
                <div className="relative flex-1">
                    {/* gridlines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                        {Y_AXIS_TICKS.map((tick) => (
                            <div key={tick} className="border-t border-dashed border-gray-100" />
                        ))}
                    </div>

                    <div className="relative flex h-60 items-end justify-between gap-3 px-1">
                        {data.map((d) => (
                            <div
                                key={d.day}
                                className="flex h-full flex-1 flex-col items-center justify-end"
                            >
                                <div
                                    className="w-full max-w-[42px] rounded-t-md bg-blue-900 transition-all"
                                    style={{ height: `${(d.value / CHART_MAX) * 100}%` }}
                                    title={`${d.day}: ${d.value}`}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-2 flex justify-between gap-3 px-1">
                        {data.map((d) => (
                            <span
                                key={d.day}
                                className="flex-1 text-center text-xs text-gray-400"
                            >
                                {d.day}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModuleUsageBreakdown({ modules }: { modules: ModuleUsage[] }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-base font-semibold text-gray-900">
                Module Usage Breakdown
            </h2>

            <div className="space-y-5">
                {modules.map((m) => (
                    <div key={m.name}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">{m.name}</span>
                            <span className="font-semibold text-gray-900">{m.percent}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-100">
                            <div
                                className={`h-2 rounded-full ${m.barColor}`}
                                style={{ width: `${m.percent}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SystemHealthStatus({ services }: { services: ServiceStatus[] }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-base font-semibold text-gray-900">
                System Health Status
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {services.map((s) => (
                    <div
                        key={s.name}
                        className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4"
                    >
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {s.status}
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                            {s.name}
                        </div>
                        <div className="text-xs text-gray-500">Latency: {s.latency}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function SystemAnalyticsPage() {
    return (
        <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        System Analytics
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Platform-wide usage statistics and AI performance metrics
                    </p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {STATS.map((stat) => (
                        <StatCardItem key={stat.label} stat={stat} />
                    ))}
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <WeeklySessionVolumeChart data={SESSION_VOLUME} />
                    <ModuleUsageBreakdown modules={MODULE_USAGE} />
                </div>

                {/* System health */}
                <SystemHealthStatus services={SERVICES} />
            </div>
        </main>
    );
}