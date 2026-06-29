'use client';

import { useMemo } from 'react';
import {
    BookOpen,
    Users,
    Award,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Minus,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';

/* ─── Types ─────────────────────────────────────────────── */
interface StatCard {
    icon: React.ReactNode;
    iconBg: string;
    value: string | number;
    label: string;
    trend: 'up' | 'down' | 'stable';
    trendValue: string;
}

interface Module {
    code: string;
    name: string;
    students: number;
    classAvg: number;
    passRate: number;
}

/* ─── Data ───────────────────────────────────────────────── */
const modules: Module[] = [
    { code: 'CS301', name: 'Algorithms & Data Structures', students: 38, classAvg: 74, passRate: 76 },
    { code: 'CS302', name: 'Database Systems', students: 42, classAvg: 80, passRate: 82 },
    { code: 'CS401', name: 'Advanced Algorithms', students: 31, classAvg: 67, passRate: 69 },
    { code: 'CS450', name: 'Machine Learning Fundamentals', students: 31, classAvg: 83, passRate: 85 },
];

/* ─── Sub-components ─────────────────────────────────────── */

/** Trend badge shown in top-right of stat cards */
function TrendBadge({ trend, value }: { trend: StatCard['trend']; value: string }) {
    if (trend === 'stable') {
        return (
            <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                <Minus size={12} />
                {value}
            </span>
        );
    }
    if (trend === 'up') {
        return (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                <TrendingUp size={13} />
                {value}
            </span>
        );
    }
    return (
        <span className="flex items-center gap-1 text-xs font-semibold text-red-400">
            <TrendingDown size={13} />
            {value}
        </span>
    );
}

/** Top stat card */
function StatCard({ card }: { card: StatCard }) {
    return (
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: card.iconBg }}
                >
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

/** Module list row */
function ModuleRow({ mod }: { mod: Module }) {
    return (
        <div className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-gray-50 transition-colors">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <BookOpen size={16} className="text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{mod.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                    {mod.code} • {mod.students} students
                </p>
            </div>
            <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-800">{mod.passRate}%</p>
                <p className="text-xs text-gray-400">class avg</p>
            </div>
        </div>
    );
}

/* Custom tooltip for the bar chart */
function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl bg-white border border-gray-100 shadow-lg px-4 py-3 text-sm">
                <p className="font-bold text-gray-700 mb-1">{label}</p>
                {payload.map((entry: any) => (
                    <p key={entry.name} style={{ color: entry.color }} className="font-medium">
                        {entry.name}: <span className="font-bold">{entry.value}%</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
}

/* ─── Page ───────────────────────────────────────────────── */
export default function LecturerDashboard() {
    const stats: StatCard[] = useMemo(
        () => [
            {
                icon: <BookOpen size={18} className="text-emerald-500" />,
                iconBg: '#f0fdf4',
                value: 4,
                label: 'Modules Teaching',
                trend: 'stable',
                trendValue: 'Stable',
            },
            {
                icon: <Users size={18} className="text-indigo-500" />,
                iconBg: '#eef2ff',
                value: 142,
                label: 'Total Students',
                trend: 'up',
                trendValue: '+4.2%',
            },
            {
                icon: <Award size={18} className="text-violet-500" />,
                iconBg: '#f5f3ff',
                value: '3.2',
                label: 'Class Avg GPA',
                trend: 'up',
                trendValue: '+4.2%',
            },
            {
                icon: <AlertTriangle size={18} className="text-amber-500" />,
                iconBg: '#fffbeb',
                value: 18,
                label: 'At-Risk Students',
                trend: 'down',
                trendValue: '-1.8%',
            },
        ],
        []
    );

    const chartData = modules.map((m) => ({
        name: m.code,
        'Class Average': m.classAvg,
        'Pass Rate %': m.passRate,
    }));

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Hello, Dr.</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Lecturer Dashboard — Semester 2, Academic Year 2024/25
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
                {stats.map((card) => (
                    <StatCard key={card.label} card={card} />
                ))}
            </div>

            {/* Bottom two panels */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Module Performance Overview */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <h2 className="text-base font-bold text-gray-900 mb-6">Module Performance Overview</h2>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                            barCategoryGap="30%"
                            barGap={4}
                        >
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12, fill: '#9ca3af' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                ticks={[0, 25, 50, 75, 100]}
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                            <Legend
                                iconType="square"
                                iconSize={10}
                                wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                            />
                            <Bar dataKey="Class Average" fill="#1e3a8a" radius={[4, 4, 0, 0]} maxBarSize={36} />
                            <Bar dataKey="Pass Rate %" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={36} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* My Modules */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <h2 className="text-base font-bold text-gray-900 mb-4">My Modules</h2>
                    <div className="divide-y divide-gray-50">
                        {modules.map((mod) => (
                            <ModuleRow key={mod.code} mod={mod} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}