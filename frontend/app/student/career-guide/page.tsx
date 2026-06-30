"use client";

import { useMemo, useState } from "react";
import { Brain, Briefcase, RefreshCw, Target } from "lucide-react";
import { useGetCareerRecommendationsQuery, useGenerateCareerRecommendationsMutation } from "@/lib/redux/slices/RecommendationSlice";
import { useGetMyStudentProfileQuery } from "@/lib/redux/slices/StudentSlice";

export default function CareerGuidePage() {
    const { data: profile } = useGetMyStudentProfileQuery(undefined);
    const { data: careers = [], refetch, isFetching } = useGetCareerRecommendationsQuery(undefined);
    const [generateCareers, { isLoading }] = useGenerateCareerRecommendationsMutation();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const interests = useMemo(() => {
        const raw = profile?.interests;
        if (Array.isArray(raw)) return raw;
        if (typeof raw === "string" && raw.trim()) return raw.split(",").map((item: string) => item.trim()).filter(Boolean);
        return [];
    }, [profile]);

    const handleRefresh = async () => {
        await generateCareers(undefined).unwrap();
        await refetch();
        setToast("Career recommendations refreshed from your live profile.");
        setTimeout(() => setToast(null), 2200);
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Career Guide</h1>
                        <p className="mt-1 text-sm text-gray-500">Live career matches generated from your profile, goals, and academic direction</p>
                    </div>
                    <button onClick={handleRefresh} className="inline-flex items-center gap-2 rounded-full bg-[#1e2a78] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#16205c]">
                        <RefreshCw className={`h-4 w-4 ${(isLoading || isFetching) ? "animate-spin" : ""}`} />
                        Refresh Matches
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-5">
                        {(careers as any[]).map((career) => {
                            const expanded = expandedId === career.id;
                            return (
                                <div key={career.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-gray-900">{career.career_name || career.title}</h3>
                                                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                                                    {Math.round(Number(career.match_percentage ?? 0))}% Match
                                                </span>
                                            </div>
                                            <p className="mt-1.5 text-sm text-gray-500">{career.explanation || "Recommended from your current interests and progress."}</p>
                                        </div>
                                        <div className="shrink-0 rounded-xl bg-emerald-50 px-3 py-2 text-right">
                                            <div className="text-lg font-bold text-emerald-600">{career.framework || "Interest framework"}</div>
                                            <div className="text-xs text-emerald-600/70">framework</div>
                                        </div>
                                    </div>

                                    <div className="mt-4 h-1.5 w-full rounded-full bg-gray-100">
                                        <div className="h-1.5 rounded-full bg-gradient-to-r from-[#1e2a78] to-emerald-500" style={{ width: `${Math.round(Number(career.match_percentage ?? 0))}%` }} />
                                    </div>

                                    <button onClick={() => setExpandedId(expanded ? null : career.id)} className="mt-4 text-sm font-semibold text-blue-700 hover:underline">
                                        {expanded ? "Hide details" : "View details"}
                                    </button>

                                    {expanded && (
                                        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                                            <p className="font-semibold text-gray-800">Suggested next steps</p>
                                            <ul className="mt-2 list-disc space-y-1 pl-5">
                                                <li>Build experience in {interests.length ? interests.slice(0, 2).join(" and ") : "your strongest areas"}.</li>
                                                <li>Review the career description and required skills with an advisor.</li>
                                                <li>Save the role and use chatbot guidance to plan your next semester.</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {!careers.length && (
                            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
                                No career recommendations yet. Refresh to generate them from your student profile.
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl bg-gradient-to-br from-[#1e2a78] via-[#3730a3] to-[#0ea5e9] p-6 text-white shadow-sm">
                            <h2 className="text-base font-bold">Your Interest Profile</h2>
                            <p className="mt-2 text-sm text-white/85">{profile?.career_goal || "No career goal recorded yet."}</p>
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex items-center gap-2"><Target className="h-4 w-4" /> {profile?.overall_gpa ? `GPA ${profile.overall_gpa}` : "GPA not set"}</div>
                                <div className="flex items-center gap-2"><Brain className="h-4 w-4" /> {interests.length ? interests.join(", ") : "Interests not captured yet"}</div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-bold text-gray-900">Why these careers?</h2>
                            <div className="mt-4 space-y-4 text-sm text-gray-600">
                                <div className="flex items-start gap-3">
                                    <Briefcase className="mt-0.5 h-4 w-4 text-[#1e2a78]" />
                                    Matches are generated from your live profile and backend recommendation engine.
                                </div>
                                <div className="flex items-start gap-3">
                                    <Brain className="mt-0.5 h-4 w-4 text-[#1e2a78]" />
                                    Updating your academic profile and interests will change these results automatically.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {toast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-medium text-white shadow-lg">
                    {toast}
                </div>
            )}
        </main>
    );
}
