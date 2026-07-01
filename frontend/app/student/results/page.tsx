"use client";

import { useMemo } from "react";
import { RefreshCcw, GraduationCap, Briefcase, Brain, ShieldAlert } from "lucide-react";
import { useGetAcademicSummaryQuery } from "@/lib/redux/slices/AcademicSlice";
import {
    useGetCareerRecommendationsQuery,
    useGetCourseRecommendationsQuery,
    useGetPerformanceAnalysesQuery,
    useRegenerateRecommendationsMutation,
    useGetRecommendationModelStatusQuery,
} from "@/lib/redux/slices/RecommendationSlice";
import { toast } from "sonner";

function StatCard({ label, value, hint, icon }: { label: string; value: string; hint: string; icon: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
                    <div className="mt-2 text-2xl font-bold text-gray-900">{value}</div>
                    <p className="mt-1 text-xs text-gray-500">{hint}</p>
                </div>
                <div className="rounded-2xl bg-[#1e2a78]/10 p-3 text-[#1e2a78]">{icon}</div>
            </div>
        </div>
    );
}

export default function MyResultsPage() {
    const { data: summary, refetch: refetchSummary } = useGetAcademicSummaryQuery(undefined);
    const { data: courseRecs = [], refetch: refetchCourses } = useGetCourseRecommendationsQuery(undefined);
    const { data: careerRecs = [], refetch: refetchCareers } = useGetCareerRecommendationsQuery(undefined);
    const { data: performance = [], refetch: refetchPerformance } = useGetPerformanceAnalysesQuery(undefined);
    const { data: modelStatus } = useGetRecommendationModelStatusQuery(undefined);
    const [regenerateRecommendations, { isLoading: regenerating }] = useRegenerateRecommendationsMutation();

    const latestPerformance = performance?.[0];
    const recentGrades = useMemo(() => summary?.recent_grades ?? [], [summary]);

    const handleRefresh = async () => {
        try {
            await regenerateRecommendations(undefined).unwrap();
            await Promise.all([refetchSummary(), refetchCourses(), refetchCareers(), refetchPerformance()]);
            toast.success("Results refreshed from live academic data.");
        } catch (error: any) {
            toast.error(error?.data?.detail || "Unable to refresh results.");
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="rounded-3xl bg-gradient-to-r from-[#1e2a78] to-[#1b7fbe] p-6 text-white shadow-lg">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm uppercase tracking-[0.2em] text-sky-100">Student dashboard</p>
                            <h1 className="mt-2 text-3xl font-bold">My Results</h1>
                            <p className="mt-2 max-w-2xl text-sm text-sky-50/90">
                                View your latest marks, AI recommendations, career paths, and performance risk in one place.
                            </p>
                            <div className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-sky-50">
                                AI engine: {modelStatus?.performance_model_ready ? `ready (${modelStatus.version})` : "loading"}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={regenerating}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#1e2a78] hover:bg-sky-50 disabled:opacity-60"
                        >
                            <RefreshCcw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
                            {regenerating ? "Refreshing..." : "Refresh AI"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Overall Score"
                        value={summary ? String(summary.overall_score ?? "--") : "--"}
                        hint={summary ? `Attendance ${summary.attendance_rate ?? 0}%` : "Live academic snapshot"}
                        icon={<GraduationCap className="h-5 w-5" />}
                    />
                    <StatCard
                        label="Attendance"
                        value={summary ? `${summary.attendance_rate}%` : "--"}
                        hint={summary?.at_risk ? "Needs support" : "Healthy participation"}
                        icon={<ShieldAlert className="h-5 w-5" />}
                    />
                    <StatCard
                        label="Course Matches"
                        value={String(courseRecs.length)}
                        hint="Generated from your marks and interests"
                        icon={<Briefcase className="h-5 w-5" />}
                    />
                    <StatCard
                        label="Risk Level"
                        value={latestPerformance?.risk_level ?? "--"}
                        hint={latestPerformance ? `${Math.round(Number(latestPerformance.performance_score ?? 0))}/100 performance` : "Awaiting analysis"}
                        icon={<Brain className="h-5 w-5" />}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900">Recent Grades</h2>
                        <p className="mt-1 text-sm text-gray-500">Latest marks entered by your lecturer.</p>
                        <div className="mt-5 space-y-4">
                            {recentGrades.length ? recentGrades.map((item: any) => {
                                const score = Number(item.total_score ?? item.score ?? 0);
                                return (
                                    <div key={`${item.course}-${item.semester}`} className="rounded-2xl bg-gray-50 p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className="font-semibold text-gray-900">{item.course}</div>
                                                <div className="text-xs text-gray-500">{item.semester}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-[#1e2a78]">{item.grade}</div>
                                                <div className="text-xs text-gray-500">{score}% total score</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 h-2 rounded-full bg-gray-200">
                                            <div className="h-2 rounded-full bg-gradient-to-r from-[#1e2a78] to-emerald-500" style={{ width: `${Math.min(100, score)}%` }} />
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p className="text-sm text-gray-400">No grade records are available yet.</p>
                            )}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900">Performance Analysis</h2>
                        <p className="mt-1 text-sm text-gray-500">This is recalculated when lecturers submit marks or attendance.</p>
                        {latestPerformance ? (
                            <div className="mt-5 rounded-2xl bg-gray-50 p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-gray-400">AI risk level</p>
                                        <div className="mt-2 text-3xl font-bold text-gray-900">{Math.round(Number(latestPerformance.performance_score ?? 0))}</div>
                                    </div>
                                    <div className="rounded-2xl bg-[#1e2a78] px-4 py-2 text-sm font-semibold text-white">
                                        {latestPerformance.risk_level}
                                    </div>
                                </div>
                                <p className="mt-4 text-sm text-gray-700">{latestPerformance.recommendation}</p>
                            </div>
                        ) : (
                            <p className="mt-5 text-sm text-gray-400">No performance analysis has been generated yet.</p>
                        )}
                    </section>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900">Course Recommendations</h2>
                        <p className="mt-1 text-sm text-gray-500">Dynamic suggestions based on grades, interests, and learning preferences.</p>
                        <div className="mt-5 space-y-4">
                            {courseRecs.length ? courseRecs.map((rec: any) => (
                                <div key={rec.id} className="rounded-2xl border border-gray-100 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="font-semibold text-gray-900">{rec.course}</div>
                                            <div className="mt-1 text-sm text-gray-600">{rec.reason}</div>
                                        </div>
                                        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            {Math.round(Number(rec.confidence_score ?? 0) * 100)}%
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400">No course recommendations yet. Refresh AI to generate them.</p>
                            )}
                        </div>
                    </section>

                    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900">Career Recommendations</h2>
                        <p className="mt-1 text-sm text-gray-500">Career matches are based on your interests and academic strengths.</p>
                        <div className="mt-5 space-y-4">
                            {careerRecs.length ? careerRecs.map((rec: any) => (
                                <div key={rec.id} className="rounded-2xl border border-gray-100 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="font-semibold text-gray-900">{rec.career_name}</div>
                                            <div className="mt-1 text-sm text-gray-600">{rec.explanation}</div>
                                        </div>
                                        <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                                            {Math.round(Number(rec.match_percentage ?? 0))}%
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400">No career recommendations yet. Refresh AI to generate them.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
