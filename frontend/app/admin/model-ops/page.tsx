"use client";

import { useMemo } from "react";
import { Bot, RefreshCcw, Sparkles, TrendingUp, Database, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import {
    useAdminRecomputeStudentAIMutation,
    useAdminTrainRecommendationModelsMutation,
    useGetRecommendationModelHistoryQuery,
    useGetRecommendationModelStatusQuery,
} from "@/lib/redux/slices/RecommendationSlice";

function MetricCard({
    label,
    value,
    hint,
    icon,
}: {
    label: string;
    value: string;
    hint: string;
    icon: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                    <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
                    <p className="mt-1 text-xs text-slate-500">{hint}</p>
                </div>
                <div className="rounded-2xl bg-violet-50 p-3 text-violet-700">{icon}</div>
            </div>
        </div>
    );
}

export default function ModelOpsPage() {
    const { data: modelStatus, refetch: refetchStatus } = useGetRecommendationModelStatusQuery(undefined);
    const { data: historyResponse, refetch: refetchHistory } = useGetRecommendationModelHistoryQuery(10);
    const [trainModels, { isLoading: training }] = useAdminTrainRecommendationModelsMutation();
    const [recomputeStudentAI, { isLoading: recomputing }] = useAdminRecomputeStudentAIMutation();
    const history = historyResponse?.history ?? [];

    const metrics = useMemo(
        () => [
            {
                label: "Students",
                value: String(modelStatus?.metrics?.student_count ?? "--"),
                hint: "Profiles used in the latest training run",
                icon: <TrendingUp className="h-5 w-5" />,
            },
            {
                label: "Courses",
                value: String(modelStatus?.metrics?.course_count ?? "--"),
                hint: "Active courses considered by the engine",
                icon: <Database className="h-5 w-5" />,
            },
            {
                label: "Performance R2",
                value: modelStatus?.metrics?.performance_r2 !== undefined && modelStatus?.metrics?.performance_r2 !== null
                    ? String(modelStatus.metrics.performance_r2)
                    : "--",
                hint: "Model quality from the latest training pass",
                icon: <BadgeCheck className="h-5 w-5" />,
            },
        ],
        [modelStatus]
    );

    const handleTrain = async () => {
        try {
            await trainModels(true).unwrap();
            toast.success("Model retraining started and completed successfully.");
            await Promise.all([refetchStatus(), refetchHistory()]);
        } catch (error: any) {
            toast.error(error?.data?.detail ?? "Unable to train the recommendation models.");
        }
    };

    const handleQuickRecompute = async () => {
        const studentId = window.prompt("Enter a student ID to recompute their AI insights:");
        if (!studentId?.trim()) return;
        try {
            await recomputeStudentAI(studentId.trim()).unwrap();
            toast.success("Student AI recomputed.");
        } catch (error: any) {
            toast.error(error?.data?.detail ?? "Unable to recompute student AI.");
        }
    };

    return (
        <div className="space-y-6 bg-slate-50 p-6">
            <div className="rounded-3xl bg-gradient-to-r from-slate-950 to-violet-900 p-6 text-white shadow-xl">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-violet-100">
                            <Sparkles size={14} />
                            AI Model Operations
                        </div>
                        <h1 className="mt-3 text-3xl font-bold">Training History and Metrics</h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-200">
                            Monitor the recommendation engine, retrain the hybrid model, and review the latest recorded runs in one place.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleTrain}
                            disabled={training}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Bot size={15} className={training ? "animate-pulse" : ""} />
                            {training ? "Training..." : "Train Models"}
                        </button>
                        <button
                            onClick={handleQuickRecompute}
                            disabled={recomputing}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <RefreshCcw size={15} className={recomputing ? "animate-spin" : ""} />
                            Recompute Student
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {metrics.map((metric) => (
                    <MetricCard key={metric.label} {...metric} />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900">Current Model Snapshot</h2>
                    <p className="mt-1 text-sm text-slate-500">The latest artifact and status information returned by the backend.</p>
                    <div className="mt-5 space-y-3">
                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                            <span className="text-sm font-medium text-slate-500">Version</span>
                            <span className="text-sm font-bold text-slate-900">{modelStatus?.version ?? "unknown"}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                            <span className="text-sm font-medium text-slate-500">Trained At</span>
                            <span className="text-sm font-bold text-slate-900">
                                {modelStatus?.trained_at ? new Date(modelStatus.trained_at).toLocaleString() : "not available"}
                            </span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                            <span className="text-sm font-medium text-slate-500">Training Runs</span>
                            <span className="text-sm font-bold text-slate-900">{modelStatus?.training_history_count ?? 0}</span>
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900">Training History</h2>
                    <p className="mt-1 text-sm text-slate-500">Latest recorded model runs and their quality metrics.</p>
                    <div className="mt-5 space-y-3">
                        {history.length ? (
                            history.map((entry: any, index: number) => (
                                <div key={`${entry.trained_at}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <div className="text-sm font-semibold text-slate-900">
                                                {new Date(entry.trained_at).toLocaleString()}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                {entry.student_count} students, {entry.course_count} courses, {entry.academic_record_count} records
                                            </div>
                                        </div>
                                        <div className="text-right text-xs text-slate-500">
                                            <div>R2: {entry.performance_r2 ?? "--"}</div>
                                            <div>MAE: {entry.performance_mae ?? "--"}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400">No training history has been recorded yet.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
