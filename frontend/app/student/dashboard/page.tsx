"use client";

import React, { useState } from "react";
import {
    Award,
    CalendarDays,
    BookOpen,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    MessageCircle,
    Star,
    Compass,
    BarChart3,
    ChevronRight,
    AlertTriangle,
    Briefcase,
    Clock,
} from "lucide-react";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

type TrendDirection = "up" | "down" | "stable";

interface StatCard {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    trend: TrendDirection;
    trendValue?: string;
    value: string;
    label: string;
    sublabel: string;
}

interface GpaPoint {
    label: string;
    value: number;
}

interface QuickAction {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    title: string;
    href: string;
}

interface Deadline {
    id: string;
    title: string;
    due: string;
    urgent: boolean;
}

// ----------------------------------------------------------------------------
// Static data — swap for real data from your API
// ----------------------------------------------------------------------------

const STATS: StatCard[] = [
    {
        icon: <Award className="h-5 w-5" />,
        iconBg: "bg-indigo-50",
        iconColor: "text-indigo-500",
        trend: "up",
        trendValue: "+4.2%",
        value: "3.8",
        label: "Current GPA",
        sublabel: "Top 15% of class",
    },
    {
        icon: <CalendarDays className="h-5 w-5" />,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-500",
        trend: "down",
        trendValue: "-1.8%",
        value: "85%",
        label: "Attendance",
        sublabel: "6 sessions missed",
    },
    {
        icon: <BookOpen className="h-5 w-5" />,
        iconBg: "bg-sky-50",
        iconColor: "text-sky-500",
        trend: "stable",
        value: "6",
        label: "Courses Enrolled",
        sublabel: "2 pending completion",
    },
    {
        icon: <Target className="h-5 w-5" />,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-500",
        trend: "up",
        trendValue: "+4.2%",
        value: "95%",
        label: "Career Match",
        sublabel: "Software Engineer",
    },
];

const GPA_TREND: GpaPoint[] = [
    { label: "Sem 1", value: 3.1 },
    { label: "Sem 2", value: 3.35 },
    { label: "Sem 3", value: 3.05 },
    { label: "Sem 4", value: 3.55 },
    { label: "Sem 5", value: 3.45 },
    { label: "Sem 6", value: 3.8 },
];

const QUICK_ACTIONS: QuickAction[] = [
    {
        icon: <MessageCircle className="h-4 w-4" />,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-500",
        title: "Chat with AI Advisor",
        href: "/student/chatbot",
    },
    {
        icon: <Star className="h-4 w-4" />,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
        title: "View Recommendations",
        href: "/student/courses",
    },
    {
        icon: <Compass className="h-4 w-4" />,
        iconBg: "bg-cyan-50",
        iconColor: "text-cyan-500",
        title: "Explore Career Paths",
        href: "/student/career-guide",
    },
    {
        icon: <BarChart3 className="h-4 w-4" />,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-500",
        title: "My Performance Report",
        href: "/student/analytics",
    },
];

const DEADLINES: Deadline[] = [
    { id: "d1", title: "CS401 Project Report", due: "In 2 days", urgent: true },
    { id: "d2", title: "CS302 Lab Assignment", due: "In 4 days", urgent: false },
    { id: "d3", title: "MA210 Midterm Exam", due: "In 6 days", urgent: false },
];

// ----------------------------------------------------------------------------
// Chart helpers
// ----------------------------------------------------------------------------

const CHART_WIDTH = 1000;
const CHART_HEIGHT = 220;
const Y_MIN = 2.5;
const Y_MAX = 4;
const Y_TICKS = [4, 3.3, 2.9, 2.5];

function getX(index: number, total: number): number {
    return (index / (total - 1)) * CHART_WIDTH;
}

function getY(value: number): number {
    const clamped = Math.min(Math.max(value, Y_MIN), Y_MAX);
    return CHART_HEIGHT - ((clamped - Y_MIN) / (Y_MAX - Y_MIN)) * CHART_HEIGHT;
}

function buildLinePath(points: GpaPoint[]): string {
    return points
        .map((p, i) => {
            const x = getX(i, points.length);
            const y = getY(p.value);
            return `${i === 0 ? "M" : "L"}${x},${y}`;
        })
        .join(" ");
}

function buildAreaPath(points: GpaPoint[]): string {
    const line = points
        .map((p, i) => `${getX(i, points.length)},${getY(p.value)}`)
        .join(" L");
    return `M${line} L${CHART_WIDTH},${CHART_HEIGHT} L0,${CHART_HEIGHT} Z`;
}

// ----------------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------------

function TrendBadge({ trend, value }: { trend: TrendDirection; value?: string }) {
    if (trend === "stable") {
        return <span className="text-xs font-medium text-gray-400">Stable</span>;
    }
    const isUp = trend === "up";
    return (
        <span
            className={`flex items-center gap-1 text-xs font-medium ${isUp ? "text-emerald-500" : "text-red-500"
                }`}
        >
            {isUp ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {value}
        </span>
    );
}

function StatCardItem({ stat }: { stat: StatCard }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}
                >
                    {stat.icon}
                </div>
                <TrendBadge trend={stat.trend} value={stat.trendValue} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="mt-1 text-sm font-medium text-gray-600">
                {stat.label}
            </div>
            <div className="text-xs text-gray-400">{stat.sublabel}</div>
        </div>
    );
}

function GpaTrendChart({ data }: { data: GpaPoint[] }) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">GPA Trend</h2>
            <p className="mb-6 text-sm text-gray-400">Across all semesters</p>

            <div className="flex">
                {/* Y axis */}
                <div className="mr-3 flex flex-col justify-between text-xs text-gray-400">
                    {Y_TICKS.map((t) => (
                        <span key={t} className="leading-none">
                            {t}
                        </span>
                    ))}
                </div>

                {/* Chart */}
                <div className="relative flex-1">
                    <svg
                        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                        className="h-56 w-full overflow-visible"
                        preserveAspectRatio="none"
                    >
                        {/* gridlines */}
                        {Y_TICKS.map((t) => (
                            <line
                                key={t}
                                x1={0}
                                x2={CHART_WIDTH}
                                y1={getY(t)}
                                y2={getY(t)}
                                stroke="#e5e7eb"
                                strokeDasharray="4 4"
                                strokeWidth={1}
                            />
                        ))}

                        {/* area fill */}
                        <defs>
                            <linearGradient id="gpaFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#1e2a78" stopOpacity={0.18} />
                                <stop offset="100%" stopColor="#1e2a78" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <path d={buildAreaPath(data)} fill="url(#gpaFill)" />

                        {/* line */}
                        <path
                            d={buildLinePath(data)}
                            fill="none"
                            stroke="#1e2a78"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* points */}
                        {data.map((p, i) => {
                            const x = getX(i, data.length);
                            const y = getY(p.value);
                            return (
                                <g key={p.label}>
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={hoverIndex === i ? 7 : 5}
                                        fill="#1e2a78"
                                        stroke="white"
                                        strokeWidth={2}
                                        className="cursor-pointer transition-all"
                                        onMouseEnter={() => setHoverIndex(i)}
                                        onMouseLeave={() => setHoverIndex(null)}
                                    />
                                    {hoverIndex === i && (
                                        <g>
                                            <rect
                                                x={x - 28}
                                                y={y - 38}
                                                width={56}
                                                height={24}
                                                rx={6}
                                                fill="#111827"
                                            />
                                            <text
                                                x={x}
                                                y={y - 21}
                                                textAnchor="middle"
                                                fontSize="13"
                                                fill="white"
                                                fontWeight={600}
                                            >
                                                {p.value.toFixed(2)}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    <div className="mt-2 flex justify-between text-xs text-gray-400">
                        {data.map((p) => (
                            <span key={p.label}>{p.label}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuickActionsCard({ actions }: { actions: QuickAction[] }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Quick Actions</h2>
            <div className="space-y-1.5">
                {actions.map((action) => (
                    <a
                        key={action.title}
                        href={action.href}
                        className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-gray-50"
                    >
                        <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${action.iconBg} ${action.iconColor}`}
                        >
                            {action.icon}
                        </span>
                        <span className="flex-1 text-sm font-semibold text-gray-800">
                            {action.title}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                    </a>
                ))}
            </div>
        </div>
    );
}

function AcademicAlertCard({ onGetAdvice }: { onGetAdvice: () => void }) {
    return (
        <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-6">
            <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                <h2 className="text-base font-bold text-gray-900">Academic Alert</h2>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Your attendance in Databases (CS302) has dropped to 72%. This may
                impact your final grade. Consider attending all remaining sessions.
            </p>
            <button
                onClick={onGetAdvice}
                className="mt-4 flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
                <Briefcase className="h-4 w-4" />
                Get AI Advice
            </button>
        </div>
    );
}

function DeadlineRow({ deadline }: { deadline: Deadline }) {
    return (
        <div
            className={`flex items-center gap-3 rounded-xl px-4 py-3.5 ${deadline.urgent ? "bg-red-50" : "bg-gray-50"
                }`}
        >
            <Clock
                className={`h-4 w-4 shrink-0 ${deadline.urgent ? "text-red-500" : "text-gray-400"
                    }`}
            />
            <div>
                <div className="text-sm font-semibold text-gray-900">
                    {deadline.title}
                </div>
                <div
                    className={`text-xs font-medium ${deadline.urgent ? "text-red-500" : "text-gray-400"
                        }`}
                >
                    {deadline.due}
                </div>
            </div>
        </div>
    );
}

function UpcomingDeadlinesCard({ deadlines }: { deadlines: Deadline[] }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
                Upcoming Deadlines
            </h2>
            <div className="space-y-2.5">
                {deadlines.map((d) => (
                    <DeadlineRow key={d.id} deadline={d} />
                ))}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function StudentDashboardPage() {
    const [showAdviceToast, setShowAdviceToast] = useState(false);

    const handleGetAdvice = () => {
        setShowAdviceToast(true);
        setTimeout(() => setShowAdviceToast(false), 3000);
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                        Good morning, Alex! <span aria-hidden>👋</span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Here&apos;s your academic overview for today — Semester 6,
                        Academic Year 2024/25
                    </p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {STATS.map((stat) => (
                        <StatCardItem key={stat.label} stat={stat} />
                    ))}
                </div>

                {/* GPA trend + quick actions */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                    <GpaTrendChart data={GPA_TREND} />
                    <QuickActionsCard actions={QUICK_ACTIONS} />
                </div>

                {/* Alert + deadlines */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <AcademicAlertCard onGetAdvice={handleGetAdvice} />
                    <UpcomingDeadlinesCard deadlines={DEADLINES} />
                </div>
            </div>

            {showAdviceToast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-medium text-white shadow-lg">
                    Opening AI Advisor with tips for CS302 attendance...
                </div>
            )}
        </main>
    );
}