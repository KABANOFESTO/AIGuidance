"use client";

import React, { useState } from "react";
import {
    BarChart3,
    Brain,
    Activity,
    Plus,
    Download,
    FileText,
    Loader2,
    X,
} from "lucide-react";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

type FileFormat = "PDF" | "Excel";

interface ReportTemplate {
    id: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    title: string;
    description: string;
    accentColor: string; // text color for the "Generate & Download" link
    format: FileFormat;
}

interface RecentReport {
    id: string;
    title: string;
    generatedLabel: string;
    size: string;
    format: FileFormat;
}

// ----------------------------------------------------------------------------
// Static template config — swap for real data/report definitions
// ----------------------------------------------------------------------------

const TEMPLATES: ReportTemplate[] = [
    {
        id: "student-performance",
        icon: <BarChart3 className="h-5 w-5" />,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-700",
        title: "Student Performance Report",
        description: "Comprehensive grade and attendance analysis",
        accentColor: "text-gray-700",
        format: "PDF",
    },
    {
        id: "ai-recommendations",
        icon: <Brain className="h-5 w-5" />,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-500",
        title: "AI Recommendations Audit",
        description: "Accuracy and usage metrics for AI modules",
        accentColor: "text-purple-600",
        format: "PDF",
    },
    {
        id: "system-diagnostic",
        icon: <Activity className="h-5 w-5" />,
        iconBg: "bg-cyan-50",
        iconColor: "text-cyan-500",
        title: "System Diagnostic Report",
        description: "Technical performance and uptime report",
        accentColor: "text-cyan-600",
        format: "PDF",
    },
];

const INITIAL_REPORTS: RecentReport[] = [
    {
        id: "r1",
        title: "June 2024 — Student Performance Summary",
        generatedLabel: "Generated Today, 09:15",
        size: "2.4 MB",
        format: "PDF",
    },
    {
        id: "r2",
        title: "May 2024 — AI Recommendation Audit",
        generatedLabel: "Generated Yesterday, 14:30",
        size: "1.8 MB",
        format: "PDF",
    },
    {
        id: "r3",
        title: "Q2 2024 — System Diagnostic Report",
        generatedLabel: "Generated 3 days ago",
        size: "3.1 MB",
        format: "PDF",
    },
    {
        id: "r4",
        title: "June 2024 — At-Risk Student Alerts",
        generatedLabel: "Generated 1 week ago",
        size: "0.9 MB",
        format: "Excel",
    },
];

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

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

function randomSize(): string {
    return `${(Math.random() * 3 + 0.5).toFixed(1)} MB`;
}

// ----------------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------------

function TemplateCard({
    template,
    onGenerate,
    isGenerating,
}: {
    template: ReportTemplate;
    onGenerate: (template: ReportTemplate) => void;
    isGenerating: boolean;
}) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${template.iconBg} ${template.iconColor}`}
            >
                {template.icon}
            </div>
            <h3 className="text-base font-semibold text-gray-900">
                {template.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{template.description}</p>

            <button
                onClick={() => onGenerate(template)}
                disabled={isGenerating}
                className={`mt-4 flex items-center gap-1.5 text-sm font-medium ${template.accentColor} disabled:cursor-not-allowed disabled:opacity-60`}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Download className="h-4 w-4" />
                        Generate &amp; Download
                    </>
                )}
            </button>
        </div>
    );
}

function FormatBadge({ format }: { format: FileFormat }) {
    return (
        <span className="rounded-md border border-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
            {format}
        </span>
    );
}

function ReportRow({
    report,
    onDownload,
}: {
    report: RecentReport;
    onDownload: (report: RecentReport) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4 last:border-b-0">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-400">
                    <FileText className="h-4 w-4" />
                </div>
                <div>
                    <div className="text-sm font-semibold text-gray-900">
                        {report.title}
                    </div>
                    <div className="text-xs text-gray-400">
                        {report.generatedLabel} • {report.size}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <FormatBadge format={report.format} />
                <button
                    onClick={() => onDownload(report)}
                    aria-label={`Download ${report.title}`}
                    className="text-gray-400 transition hover:text-gray-700"
                >
                    <Download className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

function NewReportModal({
    onClose,
    onCreate,
}: {
    onClose: () => void;
    onCreate: (title: string, format: FileFormat) => void;
}) {
    const [title, setTitle] = useState("");
    const [format, setFormat] = useState<FileFormat>("PDF");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onCreate(title.trim(), format);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">New Report</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="text-gray-400 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Report name
                        </label>
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. July 2024 — Attendance Summary"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Format
                        </label>
                        <div className="flex gap-2">
                            {(["PDF", "Excel"] as FileFormat[]).map((f) => (
                                <button
                                    type="button"
                                    key={f}
                                    onClick={() => setFormat(f)}
                                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${format === f
                                        ? "border-blue-900 bg-blue-900 text-white"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Create report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function ReportsAndDiagnosticsPage() {
    const [reports, setReports] = useState<RecentReport[]>(INITIAL_REPORTS);
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    const addReport = (title: string, format: FileFormat) => {
        const newReport: RecentReport = {
            id: `r-${Date.now()}`,
            title,
            generatedLabel: "Generated Just now",
            size: randomSize(),
            format,
        };
        setReports((prev) => [newReport, ...prev]);
    };

    const handleGenerate = (template: ReportTemplate) => {
        setGeneratingId(template.id);
        // simulate report generation latency
        setTimeout(() => {
            const title = `${new Date().toLocaleString("en-US", {
                month: "long",
                year: "numeric",
            })} — ${template.title}`;

            addReport(title, template.format);

            downloadTextFile(
                `${title.replace(/[^a-z0-9]+/gi, "-")}.${template.format === "PDF" ? "pdf" : "xlsx"
                }`,
                `${title}\n\nThis is a placeholder file generated for "${template.title}".\nGenerated at: ${new Date().toString()}`
            );

            setGeneratingId(null);
        }, 1200);
    };

    const handleDownload = (report: RecentReport) => {
        downloadTextFile(
            `${report.title.replace(/[^a-z0-9]+/gi, "-")}.${report.format === "PDF" ? "pdf" : "xlsx"
            }`,
            `${report.title}\n\n${report.generatedLabel} • ${report.size}`
        );
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Reports &amp; Diagnostics
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Generate and manage academic and system performance reports
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                    >
                        <Plus className="h-4 w-4" />
                        New Report
                    </button>
                </div>

                {/* Template cards */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {TEMPLATES.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onGenerate={handleGenerate}
                            isGenerating={generatingId === template.id}
                        />
                    ))}
                </div>

                {/* Recent reports */}
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <h2 className="border-b border-gray-100 px-6 py-5 text-base font-semibold text-gray-900">
                        Recent Reports
                    </h2>

                    <div>
                        {reports.length === 0 ? (
                            <p className="px-6 py-8 text-center text-sm text-gray-400">
                                No reports yet. Generate one above to get started.
                            </p>
                        ) : (
                            reports.map((report) => (
                                <ReportRow
                                    key={report.id}
                                    report={report}
                                    onDownload={handleDownload}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <NewReportModal
                    onClose={() => setShowModal(false)}
                    onCreate={(title, format) => {
                        addReport(title, format);
                        setShowModal(false);
                    }}
                />
            )}
        </main>
    );
}