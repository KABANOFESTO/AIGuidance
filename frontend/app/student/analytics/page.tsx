"use client";

import React, { useMemo, useRef, useState } from "react";
import {
    Award,
    CalendarDays,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Loader2,
} from "lucide-react";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

type TrendDirection = "up" | "down" | "stable";
type ModuleStatus = "Excellent" | "Good" | "At Risk";

interface StatCard {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    trend: TrendDirection;
    trendValue?: string;
    value: string;
    label: string;
    sublabel?: string;
}

interface SubjectScore {
    subject: string;
    score: number;
    colorClass: string;
}

interface AttendancePoint {
    month: string;
    value: number;
}

interface ModuleReportRow {
    module: string;
    code: string;
    score: number;
    attendance: number;
    status: ModuleStatus;
    trend: TrendDirection;
}

// ----------------------------------------------------------------------------
// Static data — swap for real performance data from your API
// ----------------------------------------------------------------------------

const STATS: StatCard[] = [
    {
        icon: <Award className="h-5 w-5" />,
        iconBg: "bg-indigo-50",
        iconColor: "text-indigo-500",
        trend: "up",
        trendValue: "+4.2%",
        value: "3.8 / 4.0",
        label: "Overall GPA",
    },
    {
        icon: <CalendarDays className="h-5 w-5" />,
        iconBg: "bg-orange-50",
        iconColor: "text-orange-500",
        trend: "down",
        trendValue: "-1.8%",
        value: "85%",
        label: "Attendance Rate",
    },
    {
        icon: <CheckCircle2 className="h-5 w-5" />,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-500",
        trend: "up",
        trendValue: "+4.2%",
        value: "42 / 48",
        label: "Assignments Done",
    },
    {
        icon: <AlertCircle className="h-5 w-5" />,
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
        trend: "stable",
        value: "2",
        label: "At-Risk Subjects",
        sublabel: "Needs attention",
    },
];

const SUBJECT_SCORES: SubjectScore[] = [
    { subject: "Algorithms", score: 88, colorClass: "bg-emerald-500" },
    { subject: "Databases", score: 75, colorClass: "bg-[#1e2a78]" },
    { subject: "Networks", score: 82, colorClass: "bg-[#1e2a78]" },
    { subject: "AI/ML", score: 91, colorClass: "bg-emerald-500" },
    { subject: "Software Eng", score: 79, colorClass: "bg-[#1e2a78]" },
    { subject: "Math", score: 86, colorClass: "bg-emerald-500" },
];

const ATTENDANCE_TREND: AttendancePoint[] = [
    { month: "Jan", value: 92 },
    { month: "Feb", value: 88 },
    { month: "Mar", value: 95 },
    { month: "Apr", value: 80 },
    { month: "May", value: 86 },
    { month: "Jun", value: 90 },
];

const MODULE_REPORT: ModuleReportRow[] = [
    {
        module: "Algorithms",
        code: "CS401",
        score: 88,
        attendance: 90,
        status: "Good",
        trend: "up",
    },
    {
        module: "Databases",
        code: "CS302",
        score: 75,
        attendance: 72,
        status: "At Risk",
        trend: "down",
    },
    {
        module: "Networks",
        code: "CS350",
        score: 82,
        attendance: 88,
        status: "Good",
        trend: "up",
    },
    {
        module: "AI/ML",
        code: "CS450",
        score: 91,
        attendance: 95,
        status: "Excellent",
        trend: "up",
    },
];

// ----------------------------------------------------------------------------
// Chart geometry helpers
// ----------------------------------------------------------------------------

const BAR_CHART_MAX = 100;
const BAR_Y_TICKS = [100, 75, 50, 25, 0];

const LINE_CHART_WIDTH = 1000;
const LINE_CHART_HEIGHT = 220;
const LINE_Y_MIN = 60;
const LINE_Y_MAX = 100;
const LINE_Y_TICKS = [100, 90, 80, 70, 60];

function getLineX(index: number, total: number): number {
    return (index / (total - 1)) * LINE_CHART_WIDTH;
}

function getLineY(value: number): number {
    const clamped = Math.min(Math.max(value, LINE_Y_MIN), LINE_Y_MAX);
    return (
        LINE_CHART_HEIGHT -
        ((clamped - LINE_Y_MIN) / (LINE_Y_MAX - LINE_Y_MIN)) * LINE_CHART_HEIGHT
    );
}

function buildSmoothPath(points: AttendancePoint[]): string {
    if (points.length < 2) return "";
    const coords = points.map((p, i) => ({
        x: getLineX(i, points.length),
        y: getLineY(p.value),
    }));

    let path = `M${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
        const curr = coords[i];
        const next = coords[i + 1];
        const midX = (curr.x + next.x) / 2;
        path += ` C${midX},${curr.y} ${midX},${next.y} ${next.x},${next.y}`;
    }
    return path;
}

function buildAreaPath(points: AttendancePoint[]): string {
    const line = buildSmoothPath(points);
    const lastX = getLineX(points.length - 1, points.length);
    return `${line} L${lastX},${LINE_CHART_HEIGHT} L0,${LINE_CHART_HEIGHT} Z`;
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
            {stat.sublabel && (
                <div className="text-xs text-gray-400">{stat.sublabel}</div>
            )}
        </div>
    );
}

function SubjectPerformanceChart({ data }: { data: SubjectScore[] }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Subject Performance</h2>
            <p className="mb-6 text-sm text-gray-400">Score by module</p>

            <div className="flex">
                <div className="mr-3 flex flex-col justify-between text-xs text-gray-400">
                    {BAR_Y_TICKS.map((t) => (
                        <span key={t} className="leading-none">
                            {t}
                        </span>
                    ))}
                </div>

                <div className="relative flex-1">
                    <div className="absolute inset-0 flex flex-col justify-between">
                        {BAR_Y_TICKS.map((t) => (
                            <div key={t} className="border-t border-dashed border-gray-100" />
                        ))}
                    </div>

                    <div className="relative flex h-60 items-end justify-between gap-3 px-1">
                        {data.map((d) => (
                            <div
                                key={d.subject}
                                className="flex h-full flex-1 flex-col items-center justify-end"
                            >
                                <div
                                    className={`w-full max-w-[46px] rounded-t-md ${d.colorClass} transition-all`}
                                    style={{ height: `${(d.score / BAR_CHART_MAX) * 100}%` }}
                                    title={`${d.subject}: ${d.score}`}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-2 flex justify-between gap-3 px-1">
                        {data.map((d) => (
                            <span
                                key={d.subject}
                                className="flex-1 text-center text-xs text-gray-400"
                            >
                                {d.subject}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function AttendanceTrendChart({ data }: { data: AttendancePoint[] }) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Attendance Trend</h2>
            <p className="mb-6 text-sm text-gray-400">Monthly attendance rate</p>

            <div className="flex">
                <div className="mr-3 flex flex-col justify-between text-xs text-gray-400">
                    {LINE_Y_TICKS.map((t) => (
                        <span key={t} className="leading-none">
                            {t}
                        </span>
                    ))}
                </div>

                <div className="relative flex-1">
                    <svg
                        viewBox={`0 0 ${LINE_CHART_WIDTH} ${LINE_CHART_HEIGHT}`}
                        className="h-56 w-full overflow-visible"
                        preserveAspectRatio="none"
                    >
                        {LINE_Y_TICKS.map((t) => (
                            <line
                                key={t}
                                x1={0}
                                x2={LINE_CHART_WIDTH}
                                y1={getLineY(t)}
                                y2={getLineY(t)}
                                stroke="#e5e7eb"
                                strokeDasharray="4 4"
                                strokeWidth={1}
                            />
                        ))}

                        <defs>
                            <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.18} />
                                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <path d={buildAreaPath(data)} fill="url(#attendanceFill)" />

                        <path
                            d={buildSmoothPath(data)}
                            fill="none"
                            stroke="#7c3aed"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {data.map((p, i) => {
                            const x = getLineX(i, data.length);
                            const y = getLineY(p.value);
                            return (
                                <g key={p.month}>
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={hoverIndex === i ? 6 : 0}
                                        fill="#7c3aed"
                                        stroke="white"
                                        strokeWidth={2}
                                        className="cursor-pointer transition-all"
                                        onMouseEnter={() => setHoverIndex(i)}
                                        onMouseLeave={() => setHoverIndex(null)}
                                    />
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={10}
                                        fill="transparent"
                                        className="cursor-pointer"
                                        onMouseEnter={() => setHoverIndex(i)}
                                        onMouseLeave={() => setHoverIndex(null)}
                                    />
                                    {hoverIndex === i && (
                                        <g>
                                            <rect
                                                x={x - 24}
                                                y={y - 36}
                                                width={48}
                                                height={22}
                                                rx={6}
                                                fill="#111827"
                                            />
                                            <text
                                                x={x}
                                                y={y - 21}
                                                textAnchor="middle"
                                                fontSize="12"
                                                fill="white"
                                                fontWeight={600}
                                            >
                                                {p.value}%
                                            </text>
                                        </g>
                                    )}
                                </g>
                            );
                        })}
                    </svg>

                    <div className="mt-2 flex justify-between text-xs text-gray-400">
                        {data.map((p) => (
                            <span key={p.month}>{p.month}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: ModuleStatus }) {
    const styles: Record<ModuleStatus, string> = {
        Excellent: "bg-emerald-50 text-emerald-600",
        Good: "bg-blue-50 text-blue-600",
        "At Risk": "bg-orange-50 text-orange-600",
    };
    return (
        <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
        >
            {status}
        </span>
    );
}

function TrendArrow({ trend }: { trend: TrendDirection }) {
    if (trend === "up") {
        return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
    }
    if (trend === "down") {
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
    return <span className="text-xs text-gray-400">—</span>;
}

function DetailedModuleReport({ rows }: { rows: ModuleReportRow[] }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <h2 className="px-6 pt-6 text-lg font-bold text-gray-900">
                Detailed Module Report
            </h2>

            <div className="overflow-x-auto">
                <table className="mt-4 w-full min-w-[700px] text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                            <th className="px-6 py-3">Module</th>
                            <th className="px-6 py-3">Code</th>
                            <th className="px-6 py-3">Score</th>
                            <th className="px-6 py-3">Attendance</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr
                                key={row.code}
                                className="border-b border-gray-50 last:border-b-0"
                            >
                                <td className="px-6 py-4 font-semibold text-gray-900">
                                    {row.module}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                        {row.code}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900">
                                    {row.score}%
                                </td>
                                <td className="px-6 py-4 text-gray-600">{row.attendance}%</td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={row.status} />
                                </td>
                                <td className="px-6 py-4">
                                    <TrendArrow trend={row.trend} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="h-4" />
        </div>
    );
}

// ----------------------------------------------------------------------------
// PDF export
// ----------------------------------------------------------------------------

async function exportElementToPdf(element: HTMLElement, filename: string) {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
    ]);

    const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#f9fafb",
        useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    // A4 page in points, scaled to fit the captured width.
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    pdf.save(filename);
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function PerformanceAnalyticsPage() {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    const dateStamp = useMemo(
        () =>
            new Date().toISOString().slice(0, 10).replace(/-/g, ""),
        []
    );

    const handleExportPdf = async () => {
        if (!reportRef.current) return;
        setIsExporting(true);
        setExportError(null);
        try {
            await exportElementToPdf(
                reportRef.current,
                `performance-analytics-${dateStamp}.pdf`
            );
        } catch (err) {
            console.error(err);
            setExportError(
                "Couldn't generate the PDF. Make sure 'jspdf' and 'html2canvas' are installed."
            );
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Performance Analytics
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            A detailed breakdown of your academic performance this semester
                        </p>
                    </div>

                    <button
                        onClick={handleExportPdf}
                        disabled={isExporting}
                        className="flex items-center gap-2 rounded-xl bg-[#1e2a78] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#16205c] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Export as PDF
                            </>
                        )}
                    </button>
                </div>

                {exportError && (
                    <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {exportError}
                    </div>
                )}

                {/* Everything inside this ref gets captured into the PDF */}
                <div ref={reportRef} className="space-y-6 bg-gray-50 pb-2">
                    {/* Stat cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {STATS.map((stat) => (
                            <StatCardItem key={stat.label} stat={stat} />
                        ))}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <SubjectPerformanceChart data={SUBJECT_SCORES} />
                        <AttendanceTrendChart data={ATTENDANCE_TREND} />
                    </div>

                    {/* Detailed table */}
                    <DetailedModuleReport rows={MODULE_REPORT} />
                </div>
            </div>
        </main>
    );
}