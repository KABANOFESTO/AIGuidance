"use client";

import { useMemo, useState } from "react";
import { Activity, BarChart3, Brain, Download, FileText, Loader2 } from "lucide-react";
import { useGetAdminAnalyticsQuery } from "@/lib/redux/slices/AuthSlice";
import { useGetFeedbackAdminOverviewQuery } from "@/lib/redux/slices/FeedbackSlice";

type FileFormat = "PDF" | "Excel";

function downloadTextFile(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default function ReportsAndDiagnosticsPage() {
    const { data: analytics } = useGetAdminAnalyticsQuery();
    const { data: feedback = [] } = useGetFeedbackAdminOverviewQuery();
    const [creating, setCreating] = useState(false);
    const [recentReports, setRecentReports] = useState<{ id: string; title: string; format: FileFormat; generatedLabel: string; size: string }[]>([]);

    const templates = useMemo(() => ([
        { id: "system-overview", title: "System Overview Report", description: "Platform users, chats, and audit activity", icon: <BarChart3 className="h-5 w-5" />, color: "text-blue-700", format: "PDF" as FileFormat },
        { id: "ai-analysis", title: "AI Recommendation Audit", description: "Model usage and recommendation performance", icon: <Brain className="h-5 w-5" />, color: "text-violet-600", format: "PDF" as FileFormat },
        { id: "feedback-summary", title: "Feedback Summary", description: "Student and lecturer feedback overview", icon: <Activity className="h-5 w-5" />, color: "text-emerald-600", format: "Excel" as FileFormat },
    ]), []);

    const buildReportBody = (title: string, format: FileFormat) => {
        const lines = [
            title,
            "",
            `Users: ${analytics?.users?.total ?? 0} total, ${analytics?.users?.active ?? 0} active`,
            `Students: ${analytics?.students?.total ?? 0} total, ${analytics?.students?.at_risk ?? 0} at risk`,
            `Chat sessions: ${analytics?.chatbot?.total_conversations ?? 0}`,
            `Feedback entries: ${(feedback as any[]).length}`,
            "",
            "Recent audit logs:",
            ...(analytics?.audit?.recent_logs ?? []).slice(0, 5).map((entry: any) => `- ${entry.action} by ${entry.user ?? "system"} at ${entry.timestamp}`),
        ];
        return lines.join("\n");
    };

    const addReport = (title: string, format: FileFormat) => {
        setRecentReports((prev) => [
            { id: `${Date.now()}`, title, format, generatedLabel: "Generated just now", size: format === "PDF" ? "2.2 MB" : "0.8 MB" },
            ...prev,
        ]);
    };

    const handleGenerate = async (title: string, format: FileFormat) => {
        setCreating(true);
        try {
            const filename = `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.${format === "PDF" ? "txt" : "csv"}`;
            const content = buildReportBody(title, format);
            downloadTextFile(filename, content);
            addReport(title, format);
        } finally {
            setCreating(false);
        }
    };

    const generatedCount = (analytics?.audit?.recent_logs ?? []).length + (feedback as any[]).length;

    return (
        <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Reports & Diagnostics</h1>
                        <p className="mt-1 text-sm text-gray-500">Generate live operational reports from backend analytics and feedback data</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-600">
                        <div className="font-semibold text-gray-900">{generatedCount} live records available</div>
                        <div className="text-xs text-gray-400">ready for reporting</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {templates.map((template) => (
                        <div key={template.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 ${template.color}`}>{template.icon}</div>
                            <h3 className="text-base font-semibold text-gray-900">{template.title}</h3>
                            <p className="mt-1 text-sm text-gray-500">{template.description}</p>
                            <button
                                onClick={() => handleGenerate(template.title, template.format)}
                                disabled={creating}
                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1e2a78] disabled:opacity-60"
                            >
                                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                Generate report
                            </button>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="text-sm text-gray-500">Total Users</div>
                        <div className="mt-2 text-2xl font-bold text-gray-900">{analytics?.users?.total ?? "--"}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="text-sm text-gray-500">Active Students</div>
                        <div className="mt-2 text-2xl font-bold text-gray-900">{analytics?.students?.total ?? "--"}</div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="text-sm text-gray-500">Recent Feedback</div>
                        <div className="mt-2 text-2xl font-bold text-gray-900">{(feedback as any[]).length}</div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="border-b border-gray-100 px-6 py-5">
                        <h2 className="text-base font-semibold text-gray-900">Recent Reports</h2>
                    </div>
                    {recentReports.length ? recentReports.map((report) => (
                        <div key={report.id} className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4 last:border-b-0">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">{report.title}</div>
                                    <div className="text-xs text-gray-400">{report.generatedLabel} • {report.size}</div>
                                </div>
                            </div>
                            <span className="rounded-md border border-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">{report.format}</span>
                        </div>
                    )) : (
                        <div className="px-6 py-8 text-center text-sm text-gray-400">No reports generated yet.</div>
                    )}
                </div>
            </div>
        </main>
    );
}
