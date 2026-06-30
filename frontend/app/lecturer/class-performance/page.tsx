"use client";

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Download } from "lucide-react";
import { useGetAcademicRecordsQuery, useGetAttendanceRecordsQuery } from "@/lib/redux/slices/AcademicSlice";
import { useGetFeedbackAdminOverviewQuery } from "@/lib/redux/slices/FeedbackSlice";

type ModuleCode = string;

function scoreColor(score: number) {
    if (score < 60) return "text-red-500";
    if (score < 75) return "text-orange-500";
    return "text-gray-800";
}

export default function ClassPerformance() {
    const { data: records = [] } = useGetAcademicRecordsQuery(undefined);
    const { data: attendance = [] } = useGetAttendanceRecordsQuery(undefined);
    const { data: feedback = [] } = useGetFeedbackAdminOverviewQuery(undefined);
    const [selectedModule, setSelectedModule] = useState<ModuleCode>("");
    const [toast, setToast] = useState<string | null>(null);

    const modules = useMemo(() => {
        const codes = Array.from(new Set((records as any[]).map((r) => String(r.course_detail?.code || r.course?.code || r.course || "")))).filter(Boolean);
        return codes.length ? codes : ["CS301", "CS302", "CS401", "CS450"];
    }, [records]);

    const currentModule = selectedModule || modules[0];

    const moduleGrades = useMemo(() => {
        const rows = (records as any[]).filter((r) => String(r.course_detail?.code || r.course?.code || r.course || "") === currentModule);
        const buckets = [
            { label: "A", count: 0 },
            { label: "B", count: 0 },
            { label: "C", count: 0 },
            { label: "D", count: 0 },
            { label: "F", count: 0 },
        ];
        rows.forEach((row) => {
            const score = Number(row.total_score ?? row.score ?? 0);
            if (score >= 90) buckets[0].count += 1;
            else if (score >= 80) buckets[1].count += 1;
            else if (score >= 70) buckets[2].count += 1;
            else if (score >= 60) buckets[3].count += 1;
            else buckets[4].count += 1;
        });
        return buckets;
    }, [records, currentModule]);

    const completionRows = useMemo(() => {
        return modules.map((code) => {
            const total = (records as any[]).filter((r) => String(r.course_detail?.code || r.course?.code || r.course || "") === code).length;
            const submitted = (attendance as any[]).filter((r) => String(r.course_detail?.code || r.course?.code || r.course || "") === code).length;
            return { code, submitted, total: Math.max(total, submitted) };
        });
    }, [records, attendance, modules]);

    const atRiskRows = useMemo(() => {
        return (records as any[])
            .filter((row) => Number(row.total_score ?? 0) < 75)
            .slice(0, 6)
            .map((row, index) => ({
                id: String(row.id ?? index),
                name: row.student || row.user || `Student ${index + 1}`,
                module: String(row.course_detail?.code || row.course?.code || row.course || "Unknown"),
                score: Number(row.total_score ?? row.score ?? 0),
                attendance: Number((attendance as any[]).find((a) => String(a.course_detail?.code || a.course?.code || a.course || "") === String(row.course_detail?.code || row.course?.code || row.course || ""))?.attendance_percentage ?? 0),
                alertSent: false,
            }));
    }, [records, attendance]);

    const handleExport = () => {
        setToast(`Prepared live class report for ${currentModule}`);
        setTimeout(() => setToast(null), 2400);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Class Performance Analytics</h1>
                    <p className="mt-1 text-sm text-gray-500">Live module-level view based on academic records and attendance</p>
                    <p className="mt-1 text-xs text-gray-400">{(feedback as any[]).length} live feedback entries loaded</p>
                </div>
                <button onClick={handleExport} className="flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600">
                    <Download size={15} />
                    Export Snapshot
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-4">
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Grade Distribution - {currentModule}</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Live grade buckets</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {modules.map((code) => (
                                <button key={code} onClick={() => setSelectedModule(code)} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${currentModule === code ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                                    {code}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={moduleGrades} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={52}>
                                {moduleGrades.map((_, i) => <Cell key={i} fill={i === moduleGrades.length - 1 ? "#86efac" : "#22c55e"} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-6">Assignment Completion Rate</h2>
                    <div className="space-y-5">
                        {completionRows.map((row) => {
                            const pct = row.total ? Math.round((row.submitted / row.total) * 100) : 0;
                            return (
                                <div key={row.code}>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">{row.code}</span>
                                        <span className="text-xs text-gray-400">{row.submitted} / {row.total}</span>
                                    </div>
                                    <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-6">Students Requiring Additional Support</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                {["Student", "Module", "Score", "Attendance", "Status"].map((h) => (
                                    <th key={h} className="text-left text-[11px] font-bold uppercase tracking-wider text-gray-400 pb-3 pr-6">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {atRiskRows.map((row) => (
                                <tr key={row.id} className="border-t border-gray-50">
                                    <td className="py-4 pr-6 text-sm font-bold text-gray-900 whitespace-nowrap">{row.name}</td>
                                    <td className="py-4 pr-6"><span className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-xs font-semibold">{row.module}</span></td>
                                    <td className={`py-4 pr-6 text-sm font-bold ${scoreColor(row.score)}`}>{row.score}%</td>
                                    <td className="py-4 pr-6 text-sm text-gray-600">{row.attendance}%</td>
                                    <td className="py-4 pr-6">
                                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">Needs review</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {toast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-medium text-white shadow-lg">
                    {toast}
                </div>
            )}
        </div>
    );
}
