"use client";

import { useMemo, useRef, useState } from "react";
import { Download, Loader2, AlertCircle, CheckCircle2, CalendarDays, Award } from "lucide-react";
import { useGetAcademicSummaryQuery } from "@/lib/redux/slices/AcademicSlice";
import { useGetPerformanceAnalysesQuery } from "@/lib/redux/slices/RecommendationSlice";

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-[#1e2a78]">{icon}</div>
            </div>
            <div className="mt-4 text-2xl font-bold text-gray-900">{value}</div>
            <div className="mt-1 text-sm text-gray-500">{label}</div>
        </div>
    );
}

export default function PerformanceAnalyticsPage() {
    const reportRef = useRef<HTMLDivElement>(null);
    const { data: summary } = useGetAcademicSummaryQuery(undefined);
    const { data: analyses = [] } = useGetPerformanceAnalysesQuery(undefined);
    const [isExporting, setIsExporting] = useState(false);

    const stats = useMemo(() => ([
        { label: "Overall Score", value: summary ? String(summary.overall_score) : "--", icon: <Award className="h-5 w-5" /> },
        { label: "Attendance", value: summary ? `${summary.attendance_rate}%` : "--", icon: <CalendarDays className="h-5 w-5" /> },
        { label: "At Risk", value: summary?.at_risk ? "Yes" : "No", icon: <AlertCircle className="h-5 w-5" /> },
        { label: "Recent Analyses", value: String((analyses as any[]).length), icon: <CheckCircle2 className="h-5 w-5" /> },
    ]), [summary, analyses]);

    const grades = (summary?.recent_grades || []).map((item: any) => ({
        label: item.course || item.module || item.name || "Course",
        score: Number(item.grade ?? item.score ?? item.total_score ?? 0),
    }));

    const handleExportPdf = async () => {
        if (!reportRef.current) return;
        setIsExporting(true);
        try {
            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
            const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: "#f9fafb", useCORS: true });
            const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, imgWidth, imgHeight);
            pdf.save(`performance-analytics-${new Date().toISOString().slice(0, 10)}.pdf`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
                        <p className="mt-1 text-sm text-gray-500">Live summary from your academic record and risk analysis engine</p>
                    </div>
                    <button onClick={handleExportPdf} disabled={isExporting} className="inline-flex items-center gap-2 rounded-xl bg-[#1e2a78] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#16205c] disabled:opacity-60">
                        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        {isExporting ? "Exporting..." : "Export as PDF"}
                    </button>
                </div>

                <div ref={reportRef} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900">Recent Grades</h2>
                            <div className="mt-5 space-y-4">
                                {grades.length ? grades.map((grade: { label: string; score: number }) => (
                                    <div key={grade.label}>
                                        <div className="mb-1.5 flex items-center justify-between text-sm">
                                            <span className="font-medium text-gray-700">{grade.label}</span>
                                            <span className="font-semibold text-gray-900">{grade.score}</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-100">
                                            <div className="h-2 rounded-full bg-gradient-to-r from-[#1e2a78] to-emerald-500" style={{ width: `${Math.min(100, grade.score)}%` }} />
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-gray-400">No recent grade records yet.</p>}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900">Risk Analysis</h2>
                            <div className="mt-4 space-y-3">
                                {(analyses as any[]).slice(0, 5).map((analysis) => (
                                    <div key={analysis.id} className="rounded-xl bg-gray-50 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-gray-900">{analysis.risk_level || "analysis"}</div>
                                                <div className="text-xs text-gray-400">{analysis.recommendation || "No recommendation provided."}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-[#1e2a78]">{Math.round(Number(analysis.performance_score ?? 0))}</div>
                                                <div className="text-xs text-gray-400">score</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {!analyses.length && <p className="text-sm text-gray-400">Performance analyses will appear here after the backend generates them.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
